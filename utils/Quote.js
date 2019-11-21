// Data model for quotes
// B/c firebase does not support custom objects in Node,
// this will only be used when pulling quote data, not uploading.
module.exports = class {
	constructor(author, body, timestamp, votes){
		this.author = author;
		this.body = body;
		this.date = require('./utils').parseTimestamp(timestamp);
		this.timestamp = timestamp;
		this.votes = votes;
	}
	/**
	 * Sorts quote objects into descending order to be used with .sort()
	 * @param {object} date			quote object containing unix timestamp in seconds under a date property
	 * @param {object} compareTo	quote object to be compared against
	 * @return {number} 			number stating which object should go next in the array
	*/
	static sortDatesDescending(date, compareTo) {
		const moment = require('moment');
		// Get moment objects from unix seconds
		const asDate1 = moment.unix(date.timestamp);
		const asDate2 = moment.unix(compareTo.timestamp);
		// If date comes after, put compareTo as the next element.
		// If date comes before, put it as the next element.
		return moment(asDate1).isAfter(asDate2) ? -1 : 1;
	}
	set setDate(date) {
		this.date = date;
	}
}