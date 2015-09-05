var map = require('express').Router();
var q = require('q');
var GoogleMapsAPI = require('googlemaps');
var _ = require('underscore');
var gmAPI = new GoogleMapsAPI({ key: "AIzaSyD7t0xpd1kxZ2HcyxkWl9xHtKa4FCNfutc" });

function handleError(err, response) {
    response.status(500);
    response.send(err);
}

function runAsyncMethod(m, args) {
    var deferred = q.defer();
    m.apply(gmAPI, [ args, function(err, result) {
        if (err) return deferred.reject(err);
        deferred.resolve(result);
    }]);
    return deferred.promise;
}

function placesSearch(location) {
    return runAsyncMethod(gmAPI.placeSearch, { location: location, radius: 200, language: "he" });
}

function reverseGeocode(location) {
    return runAsyncMethod(gmAPI.reverseGeocode, { latlng: location, language: "he" });
}

map.get("/lookup/:lat/:lng", function(req, res) {
    var loc = req.params.lat + "," + req.params.lng;

    req.db.getClosestClusters({ latitude: parseFloat(req.params.lat), longitude: parseFloat(req.params.lng) }, 300).then(function(clusters) {
        if(clusters.length) {
            res.send([_.extend(clusters[0], {
                location: {
                    lat: clusters[0].location[0],
                    lng: clusters[0].location[1]
                }
            })]);
        }
        else {
            q.all([reverseGeocode(loc), placesSearch(loc)]).then(function(results) {
                var geocodes = _.compact(_.map(results[0].results, function(geocode) {
                    if(geocode.types.indexOf("locality") == -1 && geocode.types.indexOf("political") == -1) {
                        var route = _.find(geocode['address_components'], function(comp) {
                            return comp.types.indexOf("route") != -1
                        });
                        if (route) {
                            return {
                                name: route['long_name'],
                                location: geocode['geometry'].location,
                                type: "geocode"
                            }
                        }
                    }
                }));
                var places = _.compact(_.map(results[1].results, function(place) {
                    if(place.types.indexOf("locality") == -1 && place.types.indexOf("political") == -1) {
                        return {
                            name: place['name'],
                            location: place['geometry'].location,
                            type: "place"
                        }
                    }
                }));

                res.send(_.union(geocodes, places, clusters));

            }, handleError);
        }
    }, handleError);
});


module.exports = map;