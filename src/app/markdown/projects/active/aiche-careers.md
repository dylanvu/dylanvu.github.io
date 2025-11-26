# AIChE Careers Bot

This is a Discord Bot made for the UCSB AIChE Student Chapter.

![GIF of the AIChE Careers Bot in action](/projects/web-development/aiche-careers/aiche-careers.gif)

## Technical Stack & Learning

This was actually my first project in TypeScript and my second-ever Discord Bot! I had been wanting to learn TypeScript, since I consider JavaScript my main language and the static typing of TypeScript would be handy to pick up.

After this project, the Google API finally clicked for me. I also used Cheerio.js for the first time to parse HTML (I used Python's BeautifulSoup previously to parse HTML). It was also an interesting challenge to try to find a way to circumvent LinkedIn's strict policy on no webscraping of job postings.

## Motivation

A goal for the UCSB AIChE Student Chapter is to improve professional development and opportunities for UCSB Chemical Engineering Students and most of the students use Discord for communication. So, I decided to help pass along internship and full-time opportunities using a Discord Bot that got relevant Job Alerts from LinkedIn, put it into MongoDB, and then send these opportunities every weekend so students can apply!

## Design Philosophy

Because the officers of AIChE who may own the bot after I left UCSB were, well, chemical engineers, I knew I had to make a solution that could withstand the tests of time better without an ounce of programming knowledge. While I could only have so many key words, I knew that over time, the needs of the student body would change. Thus, I opted to scrape a special Gmail inbox using the API to get new job postings. In order to onboard new alerts, officers only had to set up rules to forward the emails to the destination inbox.

I also realized that this model could easily scale beyond the 20 job alert limit LinkedIn sets up; any number of key words could be sent and processes as long as the API had the quota.

I also thought about how to design the database to accomodate for non-chemical engineering jobs and positions beyond just internships and entry level jobs, since I considered pitching this bot to other non-CS clubs like ASME.

## Reflection

At the time at building it, I was extremely proud of this project, especially as one of the first impactful projects I built while not even fully committing to Computer Science. Though I've since built bigger and more complex ones since then, this project still was one of the first ones where I put significant thought into the users of it and how it might expand, and it really did show when I talked about it during interviews.

I do think this project perfectly illustrates the potential I had to succeed in this field before I even switched majors.

## Links

https://github.com/vu-dylan/aichecareers
