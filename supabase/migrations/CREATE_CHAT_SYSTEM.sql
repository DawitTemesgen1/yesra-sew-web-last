-- Chat System Tables and Functions

-- Drop existing objects if they exist (for clean migration)
DROP FUNCTION IF EXISTS create_or_get_conversation(UUID, UUID);
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants (many-to-many)
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- RPC function to create or get existing conversation between two users
CREATE OR REPLACE FUNCTION create_or_get_conversation(
    p_user1_id UUID,
    p_user2_id UUID
)
RETURNS conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversation conversations;
    v_conversation_id UUID;
BEGIN
    -- Check if conversation already exists between these two users
    -- Find conversations where both users are participants
    SELECT c.* INTO v_conversation
    FROM conversations c
    WHERE EXISTS (
        SELECT 1 FROM conversation_participants cp1
        WHERE cp1.conversation_id = c.id AND cp1.user_id = p_user1_id
    )
    AND EXISTS (
        SELECT 1 FROM conversation_participants cp2
        WHERE cp2.conversation_id = c.id AND cp2.user_id = p_user2_id
    )
    -- Ensure it's only these two users (no group chats)
    AND (
        SELECT COUNT(*) FROM conversation_participants cp3
        WHERE cp3.conversation_id = c.id
    ) = 2
    LIMIT 1;

    -- If conversation exists, return it
    IF FOUND THEN
        RETURN v_conversation;
    END IF;

    -- Create new conversation
    INSERT INTO conversations DEFAULT VALUES
    RETURNING * INTO v_conversation;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
        (v_conversation.id, p_user1_id),
        (v_conversation.id, p_user2_id);

    RETURN v_conversation;
END;
$$;

-- Row Level Security Policies

-- Conversations: Users can only see conversations they're part of
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversations.id 
            AND cp.user_id = auth.uid()
        )
    );

-- Conversation participants: Allow all authenticated users to view
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view conversation participants"
    ON conversation_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert themselves as participants"
    ON conversation_participants FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Messages: Users can view and send messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    );
