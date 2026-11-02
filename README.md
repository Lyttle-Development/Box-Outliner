# Box Outliner

A small, dependency-free web app that generates a cutting and folding dieline for a hinged-lid cardboard box.

Enter the box's inside width, length and height in millimetres. The live preview shows red cut paths and black fold/engrave paths; **Download SVG** saves the same full-scale vector dieline.

The dieline includes a rounded tuck-in lid, side flaps, locking corner tabs and slots. It does not compensate for cardboard thickness or laser kerf, so test-fold a sample before production.

## Run locally

Open `index.html` in a browser. No build step, server, or external dependencies are required.

## Publish on GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, select the branch containing this app and the repository root (`/`) as the folder, then save. GitHub Pages will publish `index.html` directly.
