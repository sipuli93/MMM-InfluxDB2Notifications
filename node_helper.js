/* Magic Mirror
 * Node Helper: MMM-InfluxDB2Notifications
 *
 * By Simo-Pekka Taurama
 * MIT Licensed
 */

const NodeHelper = require("node_helper");
const express = require('express');

module.exports = NodeHelper.create({
	idPromise: null,

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		self.sendSocketNotification("CONNECTED");

		if (notification === "INFLUXDB2_NOTIFICATION_ID") {
			self.idPromise(payload);
		}
	},

	start: function() {
		var self = this;
		self.expressApp.use(express.json());
		self.expressApp.post("/MMM-InfluxDB2Notifications", (req, res) => {
			if (req.headers['content-type'] != "application/json") {
				res.status(400).json({ error: "'content-type' must be 'application/json'" });
			} else if (!req.body['_level']){
				res.status(400).json({ error: "Request body must have '_level'" });
			} else if (!req.body['_message']){
				res.status(400).json({ error: "Request body must have '_message'" });
			} else {
				new Promise((resolve, reject) => {
					self.idPromise = resolve;
					self.sendSocketNotification("INFLUXDB2_NOTIFICATION", {
						type: req.body['_level'],
						message: req.body['_message']
					});
				}).then((id) => {
					res.status(200).json({ id: id });
				});
			}
		});
	}
});
