### A web application to visualize ISOXML (ISO11783-10) files

This is a pure browser application for rendering ISOXML ([ISO11783-10](https://www.iso.org/standard/61581.html)) TaskSets. It uses [Deck.gl](https://deck.gl/) visualization library for rendering on the map. ISOXML parsing is done using [ISOXML.js](https://github.com/dev4Agriculture/isoxml-js) library. **The opened ISOXML files never leave the browser. All the parsing and visualization happens at client-side!**

Main features:
  * Grids. Only Grids Type 2 (ProcessDataVariable values) are supported.
  * Time Logs. The user can choose DataLogValues to render on the map.
  * The user can click on the map to see the exact value of the clicked entity (Grid cell or TimeLog item)

[Try it out: Demo!](https://d3emrh4jlarcc4.cloudfront.net/index.html)