# Box Outliner

A small, dependency-free web app that generates a cutting and folding dieline for a hinged-lid cardboard box.

Enter the box's inside width, length and height. Use the **mm / cm** switch to pick the unit: millimetres (default) take whole numbers, centimetres take decimals such as `15.5`. The live preview shows red cut paths and black fold/engrave paths; **Download SVG** saves the same full-scale vector dieline.

The dieline includes a rounded tuck-in lid, side flaps, locking corner tabs and slots, plus an optional close-fitting rectangular cut perimeter to keep the sheet rectangular. Untick **Show tight cut perimeter box** to leave it out of the preview and the downloaded SVG. It does not compensate for cardboard thickness or laser kerf, so test-fold a sample before production.

When **Split into two pieces** is enabled, the cut runs along the lid-to-wall fold so it does not bisect either panel.

## Run locally

Open `index.html` in a browser. No build step, server, or external dependencies are required. The Poppins font loads from Google Fonts when online and falls back to system fonts otherwise.

## Publish on GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, select the branch containing this app and the repository root (`/`) as the folder, then save. GitHub Pages will publish `index.html` directly.
