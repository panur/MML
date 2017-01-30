/* Author: Panu Ranta, panu.ranta@iki.fi, https://github.com/panur/MML */

'use strict';

function main() {
    console.log('ZUSS;');
    var baseLayers = {
        'Topographic': getMmlBaseLayer('maastokartta', 't'),
        'Background': getMmlBaseLayer('taustakartta', 'b'),
        'OpenStreetMap': getOsmBaseLayer('o')
    };
    var mapParams = decodePermalink();
    var map = new L.Map('map', {
        'crs': (mapParams['l'] === 'o') ? L.CRS.EPSG3857 : getMmlCrs(),
        'center': [mapParams['lat'], mapParams['lng']],
        'zoom': mapParams['z'] - getZoomOffset(mapParams['l']),
        'zoomControl': false,
        'layers': [getBaseLayer(mapParams['l'])]
    });

    map.on('baselayerchange', function(event) {
        // https://github.com/Leaflet/Leaflet/issues/2553
        var oldCenter = map.getCenter();
        var oldZoom = map.getZoom() + getZoomOffset(mapParams['l']);
        if (event.name === 'OpenStreetMap') {
            map.options.crs = L.CRS.EPSG3857;
        } else {
            if (map.options.crs === L.CRS.EPSG3857) {
                map.options.crs = getMmlCrs();
            }
        }
        mapParams['l'] = baseLayers[event.name]['options']['customOptions']['shortName'];
        map.setView(oldCenter, limitZoom(oldZoom, mapParams['l']) - getZoomOffset(mapParams['l']),
                    {'reset': true});
        updatePermalink();
    });

    map.on('moveend', function() {
        updatePermalink();
    });

    map.addControl(L.control.zoom({'position': 'bottomright'}));
    L.control.layers(baseLayers, null, {'position': 'topleft'}).addTo(map);

    if ('geolocation' in navigator) {
        createOwnLocationControl(map);
    }

    function getMmlBaseLayer(layerType, shortName) {
        var licenceUrl = 'http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501';
        var urlTemplate = 'http://avoindata.maanmittauslaitos.fi/mapcache/wmts/1.0.0/{layerType}' +
            '/default/ETRS-TM35FIN/{z}/{y}/{x}.png';
        return L.tileLayer(urlTemplate, {
            'customOptions': {'shortName': shortName, 'zoomOffset': 3},
            'layerType': layerType,
            'maxZoom': 13,
            'attribution': '&copy; <a href="' + licenceUrl + '">MML</a>'
        });
    }

    function getOsmBaseLayer(shortName) {
        return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            'customOptions': {'shortName': shortName, 'zoomOffset': 0},
            'maxZoom': 19,
            'attribution':
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
    }

    function getBaseLayer(shortName) {
        for (var baseLayerName in baseLayers) {
            if (baseLayers[baseLayerName]['options']['customOptions']['shortName'] === shortName) {
                return baseLayers[baseLayerName];
            }
        }
    }

    function getZoomOffset(layerShortName) {
        return getBaseLayer(layerShortName)['options']['customOptions']['zoomOffset'];
    }

    function getMmlCrs() {
        // http://avoindata.maanmittauslaitos.fi/mapcache/wmts?service=wmts&request=getcapabilities&version=1.0.0
        var origin = [-548576, 8388608];
        // https://epsg.io/3067
        var proj4 = '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
        return new L.Proj.CRS('EPSG:3067', proj4, {
            'resolutions': [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
            'origin': origin,
            'bounds': L.bounds(origin, [1548576, 6291456])
        });
    }

    function decodePermalink() {
        var mapParams = {
            'lat': 60.27397,
            'lng': 24.79191,
            'z': 10,
            'l': 't'
        };
        var nameValues = window.location.search.substring(1).split('&');
        for (var i = 0; i < nameValues.length; i++) {
            var nameValue = nameValues[i].split('=');
            if (nameValue.length === 2) {
                if (nameValue[0] in mapParams) {
                    mapParams[nameValue[0]] = nameValue[1];
                } else {
                    console.error('Unknown URL parameter: %s', nameValues[i]);
                }
            }
        }
        mapParams['z'] = limitZoom(mapParams['z'], mapParams['l']);
        return mapParams;
    }

    function limitZoom(zoom, layerShortName) {
        var zoomOffset = getZoomOffset(layerShortName);
        var maxZoom = getBaseLayer(layerShortName)['options']['maxZoom'];
        return Math.max(zoomOffset, Math.min(zoom, maxZoom + zoomOffset));
    }

    function updatePermalink() {
        var center = map.getCenter();
        var digits = 5;
        var params = [
            'lat=' + center.lat.toFixed(digits),
            'lng=' + center.lng.toFixed(digits),
            'z=' + (map.getZoom() + getZoomOffset(mapParams['l'])),
            'l=' + mapParams['l']
        ];
        window.history.replaceState(null, null, window.location.pathname + '?' + params.join('&'));
    }
}
