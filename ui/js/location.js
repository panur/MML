/* Author: Panu Ranta, panu.ranta@iki.fi, https://github.com/panur/MML */

'use strict';

function createOwnLocationControl(map) {
    var ownLocation = null;
    var watchPositionId = null;
    var controlElement = createControlElement();
    addLocationControl(controlElement);

    function createControlElement(statusClassName) {
        var newControlElement = document.createElement('div');
        newControlElement.className = 'findOwnLocation';
        if (statusClassName !== undefined) {
            newControlElement.className += ' ' + statusClassName;
        }
        newControlElement.title = 'show own location';
        newControlElement.textContent = '(\u25C9)';
        newControlElement.addEventListener('click', onClick, false);
        return newControlElement;

        function onClick() {
            if (watchPositionId === null) {
                newControlElement.removeEventListener('click', onClick, false);
                newControlElement.className = 'findingOwnLocation';
                newControlElement.title = 'finding own location';
                newControlElement.textContent = '(\u25CE)';
                watchPositionId = navigator.geolocation.watchPosition(onPositionSuccess,
                                                                      onPositionError,
                                                                      {'timeout': 60000});
            } else {
                navigator.geolocation.clearWatch(watchPositionId);
                watchPositionId = null;
                clearOwnLocation();
                updateControlElement();
            }
        }
    }

    function onPositionSuccess(position) {
        updateControlElement('locatingSuccess');
        var radius = Math.max(10, position.coords.accuracy);
        var pathOptions = {
            'color': 'blue',
            'weight': 2,
            'opacity': 0.4,
            'fillColor': 'black',
            'fillOpacity': 0.05,
            'clickable': false
        };
        clearOwnLocation();
        ownLocation =
            L.circle([position.coords.latitude, position.coords.longitude], radius, pathOptions);
        ownLocation.addTo(map);
        map.fitBounds(ownLocation.getBounds(), {'maxZoom': 16});
    }

    function clearOwnLocation() {
        if (ownLocation !== null) {
            map.removeLayer(ownLocation);
            ownLocation = null;
        }
    }

    function onPositionError(err) {
        updateControlElement('locatingError');
        controlElement.textContent = '(\u25EC)';
        console.log('failed to find own position: %o', err);
    }

    function updateControlElement(statusClassName) {
        var oldElement = controlElement;
        var newElement = createControlElement(statusClassName);
        oldElement.parentNode.replaceChild(newElement, oldElement);
        controlElement = newElement;
    }

    function addLocationControl(contentElement) {
        var CustomControl = L.Control.extend({
            options: {
                'position': 'topright'
            },
            onAdd: function () {
                var wrapperElement = document.createElement('div');
                wrapperElement.appendChild(contentElement);
                return wrapperElement;
            }
        });
        map.addControl(new CustomControl());
    }
}
