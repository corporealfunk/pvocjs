# System Requirements:

nodejs
npm

# Install Dependencies:

`npm install`

# Run:

### help:
`./bin/cli.js -h`

### example:
`./bin/cli.js -i path/to/soundinput.aiff -o path/to/soundoutput.aiff -b 4096 -v 1 -t 4`

# Limitations:

- only the first channel of the input will be processed.
- the Aiff writer does not guard against writing files larger than the format allows (~4GB) which will cause integer wrap-around in the headers, potentially corrupting the file.
- only AIFF files are readable. Files in AIFF-C format are not readable (including AIFF-C/swot little endian files). Throws an error if you try it.

# Development Considerations:

- the cli.js file refers to code in the ./dist directory. If you want to edit files in the ./src directory and then use the ./bin/cli.js you must run:

`npm run-script build`

first so that your changes are available to the cli.
