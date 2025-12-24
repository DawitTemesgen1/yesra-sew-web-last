-- Create storage bucket for documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-documents', 'listing-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing documents
CREATE POLICY "Anyone can view listing documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-documents');

CREATE POLICY "Authenticated users can upload listing documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-documents'
    AND auth.role() = 'authenticated'
  );
