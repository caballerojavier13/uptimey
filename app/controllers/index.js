const $ = require('jquery');
const api = require('../helpers/api');
const utils = require('../helpers/utils');
const actions = require('../helpers/actions');

/**
 * Controller for the index route
 */
module.exports = {
    /**
     * Init method
     */
    init() {
        if (utils.isCurrentLayout('index')) {

            api.get({
                route   : 'basic',
                updates : true,
                callback(data) {
                    let days = `${data.uptime.days} days`,
                        hours = `${data.uptime.hours} hours`,
                        minutes = `${data.uptime.minutes} minutes`;

                    $('title').text(`uptimey - ${days} ${hours} ${minutes}`);
                }
            });

            api.get({
                route   : 'advanced',
                updates : false,
                callback() {
                    actions.register({
                        ev: 'copy',
                        selector: '.list-value'
                    });
                }
            });

        }
    }
};