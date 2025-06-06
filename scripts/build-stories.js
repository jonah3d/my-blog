import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storiesDir = path.join(process.cwd(), '_stories');
const outputFile = path.join(process.cwd(), 'public', 'stories.json');

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Check if stories directory exists
if (!fs.existsSync(storiesDir)) {
    console.log('No _stories directory found, creating empty stories.json');
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
}

const stories = [];

// Read all markdown files from _stories directory
const files = fs.readdirSync(storiesDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
    const filePath = path.join(storiesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse frontmatter and content
    const { data, content } = matter(fileContent);

    // Convert markdown to HTML
    const htmlContent = marked(content);

    stories.push({
        id: path.basename(file, '.md'),
        title: data.title || 'Untitled',
        author: data.author || 'Anonymous',
        date: data.date || new Date().toISOString(),
        content: htmlContent,
        excerpt: content.substring(0, 200) + '...'
    });
});

// Sort by date (newest first)
stories.sort((a, b) => new Date(b.date) - new Date(a.date));

// Write to public/stories.json
fs.writeFileSync(outputFile, JSON.stringify(stories, null, 2));

console.log(`Built ${stories.length} stories to public/stories.json`);