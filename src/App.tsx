import React, { useState, useEffect } from 'react';

// --- Type Definitions for our Story data ---
// This ensures our data is consistent throughout the app.
interface Story {
    slug: string;
    title: string;
    author: string;
    date: string;
    // The main content of the story will be an HTML string
    content: string;
}

// --- Mock/Initial Data ---
// We will replace this with a real JSON file generated during our build process.
// This is just here so the app can run before we set up the full build pipeline.
const initialStories: Story[] = [
    {
        slug: 'welcome-to-the-blog',
        title: 'Welcome to Your New Blog!',
        author: 'Your Name',
        date: '2025-06-07',
        content: '<p>This is your very first story. You can edit it or delete it from the CMS. To access the admin panel, go to <code>/admin/</code> in the URL. You can start writing new stories there and they will show up here automatically after a few minutes!</p><p>Happy writing!</p>'
    }
];


// --- Main Application Component ---
export default function App() {
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [currentSlug, setCurrentSlug] = useState<string | null>(getSlugFromHash());

    // --- Data Fetching Effect ---
    // This effect runs once when the component mounts.
    // It fetches the stories.json file that our build script will create.
    useEffect(() => {
        fetch('/stories.json')
            .then(response => {
                if (!response.ok) {
                    // If stories.json isn't found, we fall back to the initial stories.
                    // This happens in local development before you've run the build script.
                    console.warn("Could not load stories.json, using initial placeholder data.");
                    return initialStories;
                }
                return response.json();
            })
            .then(data => setStories(data))
            .catch(error => {
                console.error("Error fetching stories:", error);
                setStories(initialStories); // Fallback on error
            });
    }, []);

    // --- URL Hash Change Effect ---
    // This listens for changes in the URL hash (e.g., #/my-story) to handle routing.
    useEffect(() => {
        const handleHashChange = () => {
            setCurrentSlug(getSlugFromHash());
        };

        window.addEventListener('hashchange', handleHashChange);
        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // --- Helper to get the story slug from the URL hash ---
    function getSlugFromHash() {
        return window.location.hash.replace(/^#\/?/, '');
    }

    const currentStory = currentSlug ? stories.find(s => s.slug === currentSlug) : null;

    return (
        <div className="bg-gray-50 min-h-screen font-serif text-gray-800">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        <a href="/#">Her Stories</a>
                    </h1>
                    <p className="text-gray-600 mt-1">A collection of tales and thoughts.</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/*
          This is our client-side router.
          If there's a story selected (from the URL hash), show the StoryPage.
          Otherwise, show the HomePage with all the story cards.
        */}
                {currentStory ? (
                    <StoryPage story={currentStory} />
                ) : (
                    <HomePage stories={stories} />
                )}
            </main>

            <footer className="text-center py-6 mt-12 border-t">
                <p className="text-gray-500">&copy; {new Date().getFullYear()}. All Rights Reserved.</p>
            </footer>
        </div>
    );
}


// --- Home Page Component ---
// Displays a grid of all story cards.
function HomePage({ stories }: { stories: Story[] }) {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 border-b pb-4">Latest Stories</h2>
            {stories.length === 0 ? (
                <p>No stories yet. Add your first one using the CMS!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stories.map(story => (
                        <StoryCard key={story.slug} story={story} />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Story Card Component ---
// A single card preview for a story on the home page.
function StoryCard({ story }: { story: Story }) {
    // Create a snippet from the content HTML
    const snippet = story.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';

    return (
        <a href={`#/${story.slug}`} className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
            <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">{new Date(story.date).toLocaleDateString()}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">{story.title}</h3>
                <p className="text-gray-700 leading-relaxed">{snippet}</p>
            </div>
            <div className="bg-gray-50 px-6 py-3">
                <span className="text-indigo-600 font-semibold">Read more &rarr;</span>
            </div>
        </a>
    );
}

// --- Story Page Component ---
// Displays the full content of a single story.
function StoryPage({ story }: { story: Story }) {
    return (
        <article className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-10">
            <a href="/#" className="text-indigo-600 hover:underline mb-6 inline-block">&larr; Back to all stories</a>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{story.title}</h1>
            <p className="text-gray-500 mb-6">
                By <span className="font-semibold">{story.author}</span> on {new Date(story.date).toLocaleDateString()}
            </p>
            {/* 'prose' class from Tailwind Typography gives beautiful default styling to HTML content.
        'dangerouslySetInnerHTML' is used here because our content is trusted HTML from the CMS.
      */}
            <div
                className="prose prose-lg max-w-none prose-indigo"
                dangerouslySetInnerHTML={{ __html: story.content }}
            />
        </article>
    );
}
