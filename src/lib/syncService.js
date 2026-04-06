import { supabase } from './supabase';

/**
 * Service to sync constitutional data from official sources.
 * In a production app, this would use fetch() to hit a gov.in API or an RSS feed.
 * For this integration, it simulates the sync by fetching and inserting into Supabase.
 */
export const syncConstitutionalData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: Only Admin can sync');

  // Verify Admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required for sync');
  }

  try {
    // 1. Simulate fetching from official XML/JSON feed
    // Mocking 3 latest constitutional updates/articles
    const mockFeed = [
      {
        title: 'Article 21A: Right to Education',
        content: 'The State shall provide free and compulsory education to all children of the age of six to fourteen years...',
        category_slug: 'fundamental-rights',
        is_official: true,
        source_url: 'https://legislative.gov.in/constitution-of-india'
      },
      {
        title: '106th Amendment Act, 2023',
        content: 'Constitution (One Hundred and Sixth Amendment) Act, 2023. Reserved one-third of all seats for women in Lok Sabha...',
        category_slug: 'amendments',
        is_official: true,
        source_url: 'https://egazette.gov.in/'
      }
    ];

    // 2. Insert into 'articles' table in 'under_review' status
    const { data: categories } = await supabase.from('categories').select('*');
    
    for (const item of mockFeed) {
      const category = categories?.find(c => c.slug === item.category_slug);
      
      const { error } = await supabase.from('articles').insert([{
        title: item.title,
        content: item.content,
        category_id: category?.id,
        status: 'under_review', // Needs Legal Expert approval
        source_url: item.source_url,
        is_official: true,
        excerpt: item.content.substring(0, 150) + '...'
      }]);
      
      if (error) console.error('Error syncing item:', item.title, error);
    }

    // 3. Create a sync log
    await supabase.from('sync_logs').insert([{
      admin_id: user.id,
      source_name: 'Official Legislative Feed',
      status: 'success',
      items_synced: mockFeed.length
    }]);

    return { success: true, count: mockFeed.length };
  } catch (error) {
    console.error('Core Sync Error:', error);
    await supabase.from('sync_logs').insert([{
      admin_id: user.id,
      source_name: 'Official Legislative Feed',
      status: 'failed',
      error_message: error.message
    }]);
    throw error;
  }
};
