import * as _ from 'lodash';
import * as moment from 'moment';

import { UtilsProvider } from './utils';
import { NotesProvider } from './notes';
import { ToastsProvider } from './toasts';

/**
 * Helper for API interaction
 */
export class ApiProvider {

    updateTimeout = 1000 * 60;

    constructor(public utils: UtilsProvider, public notes: NotesProvider, public toasts: ToastsProvider) { }

    /**
     * Makes an API call using the provided params
     *
     * Available options are:
     * {String} url
     * {Boolean} updates
     * {Function} callback
     *
     * @param {Object} options
     */
    get(options) {

        if (options.updates) {

            setInterval(() => {
                this._ajax(options);
            }, this.updateTimeout);

        } else {
            this._ajax(options);
        }

    }

    /**
     * Makes an Ajax call with the passed options
     * @param {Object} options
     */
    _ajax(options) {

        let normalizeUrl = this.buildUrl(options.route);

        $.ajax({
            dataType: "json",
            url: normalizeUrl,
            success: (data) => {

                this.bindData(data, options.updates);

                if (options.updates) {
                    this.notes.clearAll();
                    this.toasts.init('success', 'Data has been updated!');
                }

                $('ul.list-values').removeClass('loading');

                if (options.callback) {
                    return options.callback(data);
                }

            },
            error: () => {

                this.requestTimer();
                this.bindDataNotes();

                this.toasts.init('error', 'Server is not responding!');

            }
        });

    }

    /**
     * Binds data to DOM elements
     * @param {Object} data
     * @param {Boolean} updates
     */
    bindData(data, updates) {
        // Recursive function to update values
        let updateValues = (value, key) => {

            if (typeof value !== 'object') {

                let selector = $(`#${this.utils.normalizeString(key)}`);

                if (selector.find('span').length === 1) {
                    selector.find('span').text(value);
                } else {
                    selector.text(value);
                }

                if (updates) {
                    selector.data('data-updates', true);
                }

            } else {
                _.forEach(value, updateValues);
            }
        };

        _.forEach(data, updateValues);
    }

    /**
     * Binds notes to all data
     */
    bindDataNotes() {
        let outputBoxes = $('.data-wrapper .output');

        _.forEach(outputBoxes, () => {
            let updates = $(this).data('data-updates'),
                key = $(this).attr('id'),
                selector = $(`#${key}`).parents('.box');

            if (updates) {
                this.notes.init('error', 'Failed to update data!', selector);
            }
        });
    }

    /**
     * Builds an url for API calls
     * @param {String} string
     */
    buildUrl(string: string) {
        return `/api${string ? '/' + string : ''}`;
    }

    /**
     * Request timer when connection to server is down
     */
    requestTimer() {
        let interval = 1000,
            duration = moment.duration(this.updateTimeout * 1000, 'milliseconds'),
            counter = setInterval(() => {

                duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');

                let output = moment(duration.asMilliseconds()).format('ss');

                $('.request-timer-wrapper').removeClass('hide');
                $('.request-timer').text(output);

                if (output === '00') {
                    clearInterval(counter);
                    $('.request-timer-wrapper').addClass('hide');
                }

            }, interval);
    }
}