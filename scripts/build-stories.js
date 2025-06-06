// scripts/build-stories.mjs
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // Parses markdown frontmatter
import { marked } from 'marked';   // Converts markdown to HTML

// Define paths
const storiesDir = path.resolve(process.cwd(), '_stories');
const outputDir = path.resolve(process.cwd(), 'public');
const outputFile = path.resolve(outputDir, 'stories.json');

console.log('Starting story build process...');
console.log(`Reading stories from: ${storiesDir}`);

try {
    // Check if the stories directory exists
    if (!fs.existsSync(storiesDir)) {
        console.warn(`Stories directory not found at ${storiesDir}. Creating it.`);
        fs.mkdirSync(storiesDir, { recursive: true });
        // Optional: create a placeholder file so the build doesn't fail
        const placeholderContent = `---
title: "Placeholder Story"
author: "Admin"
date: "${new Date().toISOString().split('T')[0]}"
---

This is a placeholder file. Your real stories will appear here once you add them via the CMS.
`;
        fs.writeFileSync(path.join(storiesDir, 'placeholder.md'), placeholderContent);
        console.log('Created placeholder story.');
    }

    const filenames = fs.readdirSync(storiesDir);
    console.log(`Found ${filenames.length} files to process.`);

    const stories = filenames.map(filename => {
        // Ensure we only process markdown files
        if (path.extname(filename) !== '.md') {
            return null;
        }

        const filePath = path.join(storiesDir, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');

        // Parse markdown file for frontmatter (the stuff between ---) and content
        const { data, content } = matter(fileContents);

        // Convert markdown content to HTML
        const htmlContent = marked(content);

        return {
            slug: filename.replace(/\.md$/, ''), // Create a URL-friendly slug from the filename
            title: data.title,
            author: data.author,
            date: data.date,
            content: htmlContent, // Use the converted HTML
        };
    }).filter(Boolean); // Filter out any null values

    // Sort stories by date, newest first
    stories.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the final JSON file to the public directory
    fs.writeFileSync(outputFile, JSON.stringify(stories, null, 2));

    console.log(`✅ Successfully built ${stories.length} stories to ${outputFile}`);

} catch (error) {
    console.error('❌ Error building stories:', error);
    process.exit(1); // Exit with an error code
}
