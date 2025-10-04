# Welcome to your Lovable project

# Devnotes

// useNews.ts gathers and organizes the news articles

// supabase functions gets the news

    //why is supabase calling news_sources 

        A: news sources is used as the store for RSS Feeds

//Possible flow: page load, cronjob calls update-rss-feed which calls process-rss-feed, which uses news_sources to generate news_links

//CBC is returning a type error when update-rss-feed runs: suspected different feed formatting may be causing an issue

#//TODO//

[X]figure out why supabase isn't getting articles from all rss feeds: test via cbc 
    possibly resolved: process rss function in supabase pulls from news_sources. CBC and TorStar rss links were incorrect. Fixed those. Should start seeing results

[] Fix rate limits

[] Ensure articles on frontend fed to proper categories 

[](figure out how frontend shows articles: i.e. why so many glob and mail)

[] need to go through news_sources table in supabase and verify rss links are correct. Can edit cells in the table by clicking

[] find feed ordering in supabase and on frontend

[] fix classifications or articles (region and type)

[] fine tune classification logic, especially region (DB and frontend?)

[X] determine why the frontend only displays 10 or so rows of articles. useNews.ts seems to have the limit set to 200

    A: ColumnSection.tsx had a limit on rows. removed and added endless scroll 10 rows per scroll. Original file preserved as copy

[] Change logic so articles arent grouped by source. Current logic sorts by most recent. Some pubs dump a bunch of articles at a time, leading to ie. 5 Globe and Mail artcles in a row

[] Look into RSS formatting re CBC type error - might be fixed by adding/amending some of our types


JULIAN NOTES

// I learned how to add feeds to the database. easiest to use the SQL editor to add net new feeds. to edit feeds already in the database, it's easiest to directly edit the database itself. 

Example code:
BEGIN;

INSERT INTO news_sources
  (name, url, rss_feed_url, category, target_column, is_active)
VALUES
  -- jwz (Jamie Zawinski)
  ('jwz (Jamie Zawinski)', 'https://www.jwz.org/blog/', 'https://cdn.jwz.org/blog/feed/', 'Commentary', 'opinion', TRUE),

  -- Pluralistic (Cory Doctorow) — tag feed
  ('Pluralistic (Cory Doctorow)', 'https://pluralistic.net/', 'https://pluralistic.net/tag/rss/', 'Commentary', 'opinion', TRUE),

  -- Where''s Your Ed At? (Ed Zitron)
  ('Where''s Your Ed At? (Ed Zitron)', 'https://www.wheresyoured.at/', 'https://www.wheresyoured.at/rss/', 'Commentary', 'opinion', TRUE);

COMMIT;

// NEXT STEPS

 [] figure out why certain feeds still don't seem to be showing up (CBC, etc)
 
 [] update categories - news, commentary, current
      [] news is for reporting
      [] commentary is editorials, substacks, etc - essentially merging newspaper editorials with commentary from blogs, substacks, etc
      [] currents is long form, miscellaneous - some good examples Doctorow, Ed Zitron, jwz, more
      [] add podcasts - organize podcasts based on sections above, mix and match with written word
      
 [] brand from Heath
     [] logo / wordmark
     [] colours
     
 [] add more sources
 
 [] consider filters for ensuring diverse sources appear above fold, introduce pure chronological once scroll begins
 
 [] add button to share on Mastadon, Bluesky


## Project info

**URL**: https://lovable.dev/projects/ebdfe83a-a691-4c99-bf48-89b821ace964

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ebdfe83a-a691-4c99-bf48-89b821ace964) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ebdfe83a-a691-4c99-bf48-89b821ace964) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
