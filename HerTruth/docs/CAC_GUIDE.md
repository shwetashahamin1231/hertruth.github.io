# Congressional App Challenge 2026: what HerTruth still needs

Sources, read October 24, 2026:
- the official 2026 rulebook, https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf
- the rules page, https://www.congressionalappchallenge.us/students/rules/
- the registration page, https://www.congressionalappchallenge.us/students/student-registration/
- Rep. Watson Coleman's page, https://watsoncoleman.house.gov/services/congressional-app-challenge

## The deadline

**Monday, October 26, 2026, 12:00 pm EDT** (rulebook, section 5). The registration page says 9:00 pm ET. Plan for noon,
and aim to submit Monday morning. After the deadline a submission "cannot be modified in any way."

## Read this first: the AI and originality rules

Both are quoted from the 2026 rulebook, section 3:

> ORIGINALITY: "The app must be original and solely created by the contestant. All coding and technical development must
> be done by the student or student team." Open-source libraries and tools are allowed if their use is clearly documented.

> AI USAGE: AI tools are permitted "provided that all AI usage is fully disclosed in the submission materials. AI may only
> be used to support specific aspects of the project and must not constitute the entirety of the technical development.
> Participants are expected to demonstrate significant individual contributions and technical understanding of their app."

Judges may also ask to see the app and its source code to verify it works as described (section 7). Refusing means
disqualification.

What this means for HerTruth, plainly:
- `Submission/bleedcheck.html`, the original tested app that the quiz logic, scoring and iron model come from, is
  byte-for-byte the file in the `Claude outputs` folder.
- On October 24, Claude wrote the v4 redesign, both camera features, the Xcode app, an Expo app (since removed) and the
  new tests, working from Naveen's instructions. On October 25, Claude added the Find help map, the language picker and
  the photo layout, and cleaned the project for release.
- The 15 translations are AI first drafts.

If Claude wrote most of the code, the entry is at real risk under these rules, even with full disclosure. Only Nilakshya
and Dev know what they did themselves. Before submitting:
1. Write down honestly what each student did: research, the screening rule choice, the Colab notebook, design decisions,
   testing, outreach, and any code they wrote or changed.
2. In the time left, have the students do real technical work themselves and understand it well enough to explain it.
   Good candidates: run the notebook in Colab and explain each step; build and install the iPhone app in Xcode; make a
   change to the code; explain how the Philipp rule, the PBAC score and the logistic regression work.
3. Disclose everything (draft below). Do not shrink it.
4. If you are unsure whether your level of AI and adult help fits the rules, ask the district office before submitting.
   Rep. Watson Coleman's App Challenge page lists Deputy Communications Director Dilara Boztepe,
   dilara.boztepe@mail.house.gov.

## Checklist, in order

**Saturday night (now)**
- [ ] Review the new site (local preview) and tell Claude what to change.
- [ ] Each student registers at congressionalappchallenge.us. Do this early: there is an eligibility quiz, and the
      next step arrives by email. One student creates the team profile and invites the other.
- [ ] Keep the Xcode download going.

**Sunday**
- [ ] Approve the site, then deploy it to Netlify (drag the `web` folder; Claude refreshes that folder after you approve).
- [ ] Test on a real iPhone and Android phone (see `IPHONE_GUIDE.md`, Part 5).
- [ ] Put the `HerTruth` release folder on GitHub, public, so judges can see it. It has no NHANES data files. Do not add `node_modules/` or anything private.
- [ ] Record the demo video (script below), 1 to 3 minutes, and upload it to YouTube or Vimeo set to **Public**.
- [ ] Each student writes the answers to the application questions in their own words.
- [ ] Finish the AI disclosure.

**Monday before noon EDT**
- [ ] Submit. Check the video link plays while logged out.
- [ ] After the deadline, **each** team member completes the Exit Questionnaire separately (rulebook, section 6).

## What registration asks for (rulebook, section 2), for each student

- A personal email address, **not** a school email
- Home address with the **9-digit ZIP code** (ZIP+4, look it up at https://tools.usps.com/zip-code-lookup.htm),
  Congressional District and Member of Congress (NJ-12, Rep. Bonnie Watson Coleman, if that is your district)
- School address with 9-digit ZIP, district and Member of Congress
- A parent or guardian's name and email
- Optional: a coding teacher or mentor's name and email

Eligibility: enrolled in middle or high school on October 26, 2026. Teams of up to 4, and at least half must live or go
to school in the district. One app per student per year. Apps must be created after October 30, 2025.
Watson Coleman's page adds: only one student submits for a team. Put "Team Project" after the title and list teammates
at the end of the Description.

## The demonstration video

Required (rulebook, section 4): each participant's name, the app's name, its purpose in one clear sentence, the target
audience, the tools and coding languages, and the app working. 1 to 3 minutes. YouTube or Vimeo, **public**.
The district page says an entry "may be judged in its entirety based on this video."

Draft script, about 2 minutes. Say it in your own words, and only say what is true for you.

> **[0:00, on camera]** Hi, I'm Nilakshya Rajora, and I'm Dev Amin, from New Jersey. Our app is HerTruth.
>
> **[0:10]** HerTruth is a free, private check that helps girls and women with heavy periods find out whether to ask a
> doctor for bleeding disorder and iron testing. It's for them, their families, and the school nurses who see them
> first, in 16 languages spoken in New Jersey homes.
>
> **[0:25, show the home screen]** Heavy periods often get treated as normal. Von Willebrand disease is the most common
> inherited bleeding disorder, and some women wait 15 years or more for a diagnosis. In CDC data, 221 of 461 girls and
> women with low iron still had normal hemoglobin, so a basic anemia test missed them.
>
> **[0:45, on the phone]** The check is ten questions, adapted from the Philipp screening tool, a published rule that
> doctors use. This is not AI. You get one of three results, the reasons, the tests to ask for, and a sentence to say at
> the appointment. You can add a photo for your doctor, and it never leaves the phone. Here it is in Spanish, Hindi and
> Arabic.
>
> **[1:20, the For clinics tab]** For school nurses, a logistic regression trained on CDC NHANES data estimates iron
> deficiency from a routine blood count. On 523 people it never saw in training, it flagged 74 of 91 iron-deficient
> cases. Hemoglobin below 12 caught 48. It also raised 109 false alarms, so a flag means order a ferritin test, not a
> diagnosis.
>
> **[1:40]** We built it with HTML, CSS and JavaScript, Python and scikit-learn in Google Colab for the model, and Swift
> in Xcode for the iPhone app, and Leaflet with OpenStreetMap for the Find help map. We used Claude, an AI coding assistant, for parts of the code
> and for the translation drafts, and our AI disclosure lists exactly what it did.
>
> **[1:55]** HerTruth is not a medical device and does not diagnose anything. It helps you ask the right question.
> Thanks for watching.

Every number above is from the notebook and `model/export_site_data.py`: 221 of 461 (cohort), 523 test participants,
74 of 91 found (TP 74, FN 17), hemoglobin alone 48 of 91, 109 false alarms (FP).

## The application questions (rulebook, section 4)

The form asks questions like these. Each student should answer in their own words; judges read them for your experience.
1. What is the title of your app? *HerTruth (Team Project)*
2. Explain the app's purpose. *(the one sentence from the video works)*
3. What inspired you to create this app?
4. What technical or coding difficulty did you face, and how did you address it?
5. What did you learn while participating? What was your biggest takeaway?
6. What would you change in a 2.0 version?

Facts you can draw on, all checked:
- Iron model: test AUC 0.889 (95% CI 0.852 to 0.923); sensitivity 81.3%, specificity 74.8% at cutoff 0.392;
  shuffled-label control AUC 0.492 (the leak check)
- The Philipp tool's 89% / 95% sensitivity is for hemostatic abnormalities, mostly platelet function defects
  (120 of 217), not "bleeding disorders"
- 2.0 ideas, honestly: native-speaker clinician review of all translations; testing the iron model on a clinic's own
  records; storing photos on the device only if someone chooses to

## Draft AI-use disclosure

Fill the brackets truthfully, and remove anything that is not true.

> **AI use.** We used AI tools, mainly Claude by Anthropic, while building HerTruth, and we disclose all of it here.
>
> *Written or drafted by AI:* [the first version of the app's code, confirm]; the translations into 15 languages beyond
> English (marked on the site as first drafts awaiting review by native-speaking clinicians); and, on October 24, 2026,
> the version 4 redesign (lighter design, system fonts, animations), the two photo features, the iPhone app in Swift
> (Xcode), and automated tests; and, on October 25, 2026, the Find help map (Leaflet and
> OpenStreetMap), the language picker before the check, the home page and photo layout, a fact-check of the cited
> sources, plain-language edits to the English text, and the production cleanup. [add anything else]
>
> *Done by us:* [research, choosing the Philipp screening rule and the PBAC chart, the Colab notebook, testing, outreach,
> code you wrote or changed, decisions you made; be specific]
>
> *Not AI inside the app:* the bleeding disorder check is a published screening rule (Philipp and colleagues, 2011) and
> the iron estimate is a logistic regression trained on CDC NHANES 2017 to March 2020. Open-source and outside tools:
> scikit-learn, pandas, Playwright (tests), Leaflet, OpenStreetMap (map tiles and Nominatim place search).

## Judging (rulebook, section 7)

Judges look at the quality of the idea (creativity and originality), the implementation (user experience and design),
and demonstrated excellence of coding and programming skills. The Member of Congress's office picks the winner and may
use a panel. Be ready to show the app working and to share the GitHub link.
