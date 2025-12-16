import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/api';
import toast from 'react-hot-toast';

const PricingPlansManagement = () => {
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('plans');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchPlans(),
                fetchSubscriptions(),
                fetchStats()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        const { data, error } = await supabase
            .from('listing_pricing_plans')
            .select('*')
            .order('category_slug', { ascending: true })
            .order('display_order', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
    };

    const fetchSubscriptions = async () => {
        const { data, error } = await supabase
            .from('user_listing_subscriptions')
            .select(`
        *,
        plan:listing_pricing_plans(name, category_slug, plan_type),
        user:user_id(email)
      `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        setSubscriptions(data || []);
    };

    const fetchStats = async () => {
        // Get revenue stats
        const { data: revenueData } = await supabase
            .from('user_listing_subscriptions')
            .select('amount_paid, plan:listing_pricing_plans(category_slug, plan_type)')
            .eq('status', 'active');

        // Calculate stats
        const totalRevenue = revenueData?.reduce((sum, sub) => sum + parseFloat(sub.amount_paid || 0), 0) || 0;

        const jobsRevenue = revenueData
            ?.filter(sub => sub.plan?.category_slug === 'jobs')
            .reduce((sum, sub) => sum + parseFloat(sub.amount_paid || 0), 0) || 0;

        const tendersRevenue = revenueData
            ?.filter(sub => sub.plan?.category_slug === 'tenders')
            .reduce((sum, sub) => sum + parseFloat(sub.amount_paid || 0), 0) || 0;

        const premiumCount = revenueData?.filter(sub => sub.plan?.plan_type === 'premium').length || 0;

        setStats({
            totalRevenue,
            jobsRevenue,
            tendersRevenue,
            totalSubscriptions: revenueData?.length || 0,
            premiumSubscriptions: premiumCount
        });
    };

    const handleUpdatePrice = async (planId, newPrice) => {
        try {
            const { error } = await supabase
                .from('listing_pricing_plans')
                .update({ price: newPrice, updated_at: new Date().toISOString() })
                .eq('id', planId);

            if (error) throw error;

            toast.success('Price updated successfully');
            fetchPlans();
        } catch (error) {
            console.error('Error updating price:', error);
            toast.error('Failed to update price');
        }
    };

    const handleToggleActive = async (planId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('listing_pricing_plans')
                .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
                .eq('id', planId);

            if (error) throw error;

            toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchPlans();
        } catch (error) {
            console.error('Error toggling plan:', error);
            toast.error('Failed to update plan');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pricing Plans Management
                    </h1>
                    <p className="text-gray-600">
                        Manage Jobs & Tenders pricing plans and subscriptions
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.totalRevenue.toFixed(2)} ETB
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Jobs Revenue</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.jobsRevenue.toFixed(2)} ETB
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Tenders Revenue</div>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.tendersRevenue.toFixed(2)} ETB
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Total Subscriptions</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {stats.totalSubscriptions}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Premium Users</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {stats.premiumSubscriptions}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('plans')}
                                className={`px-6 py-4 text-sm font-medium ${activeTab === 'plans'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Pricing Plans
                            </button>
                            <button
                                onClick={() => setActiveTab('subscriptions')}
                                className={`px-6 py-4 text-sm font-medium ${activeTab === 'subscriptions'
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Active Subscriptions
                            </button>
                        </nav>
                    </div>

                    {/* Plans Tab */}
                    {activeTab === 'plans' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {['jobs', 'tenders'].map(category => (
                                    <div key={category}>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                                            {category} Plans
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {plans
                                                .filter(plan => plan.category_slug === category)
                                                .map(plan => (
                                                    <div
                                                        key={plan.id}
                                                        className={`border rounded-lg p-6 ${plan.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-gray-900">
                                                                    {plan.name}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {plan.description}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.plan_type === 'premium'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-gray-200 text-gray-700'
                                                                    }`}
                                                            >
                                                                {plan.plan_type.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">Price:</span>
                                                                <input
                                                                    type="number"
                                                                    value={plan.price}
                                                                    onChange={(e) => handleUpdatePrice(plan.id, parseFloat(e.target.value))}
                                                                    className="w-32 px-3 py-1 border border-gray-300 rounded text-right"
                                                                    step="0.01"
                                                                />
                                                                <span className="text-sm text-gray-600 ml-2">{plan.currency}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">Duration:</span>
                                                                <span className="font-medium">{plan.duration_days} days</span>
                                                            </div>

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">Monthly Limit:</span>
                                                                <span className="font-medium">
                                                                    {plan.max_listings_per_month || 'Unlimited'}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">Active Limit:</span>
                                                                <span className="font-medium">
                                                                    {plan.max_active_listings || 'Unlimited'}
                                                                </span>
                                                            </div>

                                                            <div className="pt-3 border-t">
                                                                <button
                                                                    onClick={() => handleToggleActive(plan.id, plan.is_active)}
                                                                    className={`w-full py-2 px-4 rounded font-medium ${plan.is_active
                                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                        }`}
                                                                >
                                                                    {plan.is_active ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Plan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Expires
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {subscriptions.map((sub) => (
                                            <tr key={sub.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {sub.user?.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {sub.plan?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                                    {sub.plan?.category_slug}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {sub.amount_paid} ETB
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Never'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PricingPlansManagement;
