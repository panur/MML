# What

Linkable and lightweight map with data provided by [Maanmittauslaitos](http://www.maanmittauslaitos.fi/) (National
Land Survey of Finland).

Example: http://14142.net/mml/

# How

Maanmittauslaitos publishes some of its mapping data as 
[open data](http://www.maanmittauslaitos.fi/aineistot-palvelut/rajapintapalvelut/paikkatiedon-palvelualustan-pilotti). 
Particularly data provided by Web Map Tile Service (WMTS) is utilised using the following external JavaScript libraries:

* https://github.com/Leaflet/Leaflet
* https://github.com/kartena/Proj4Leaflet
* https://github.com/proj4js/proj4js

# Why

Because Maanmittauslaitos refuces to make its map products 
([Karttapaikka](https://asiointi.maanmittauslaitos.fi/karttapaikka) and 
[Karttaikkuna - Paikkatietoikkuna](http://www.paikkatietoikkuna.fi/web/fi/kartta))
linkable with any other coordinates than ETRS-TM35FIN.

Because Karttapaikka comes with a splash screen. In 2016. It downloads four megabytes of minified
JavaScript code.
