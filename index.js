/**
 * Handles API.AI webhook calls for book search.
 */

let express = require('express');
let body_parser = require('body-parser');
let request = require('request');
let app = express();

app.use(body_parser.json());

app.post('/bookbot/webhook', (req, res) => {
  /**
   * Dump request from API.AI.
   */
  /** console.log(JSON.stringify(req.body, null, 2)); */

  /**
   * Prepare the PNX API call URL.
   */
  let title_search = req.body.result.parameters.title ? 'title,contains,' + req.body.result.parameters.title : '';
  let subject_search = req.body.result.parameters.subject ? 'any,contains,' + req.body.result.parameters.subject : '';
  let author_search = req.body.result.parameters.author ? 'author,contains,' + req.body.result.parameters.author : '';
  let query = 'q=' + [title_search, subject_search, author_search].filter(Boolean).join(';');
  let limit = 'limit=3';
  let view = 'view=full';
  let url = 'https://api-ap.hosted.exlibrisgroup.com/primo/v1/pnxs?' + [query, limit, view].join('&');

  /**
   * Dump Primo API call URL.
   */
  /** console.log(url); */

  /**
   * Make the PNX API call.
   */
  request({
    url: url,
    headers: {
      Authorization: 'apikey ' + process.env.PRIMO_API_KEY
    }
  }, (pnx_err, pnx_res, pnx_body) => {
    if (pnx_err) {
      /**
       * Return PNX error.
       */
      res.type('application/json');
      res.send({
        speech: 'Kaput! pnx_err = ' + pnx_err,
        displayText: 'Kaput! pnx_err = ' + pnx_err,
        contextOut: [],
        source: 'poc_bookbot'
      });
    } else if (pnx_res.statusCode != 200) {
      /**
       * Return PNX error.
       */
      res.type('application/json');
      res.send({
        speech: 'Kaput! pnx_res.statusCode = ' + pnx_res.statusCode,
        displayText: 'Kaput! pnx_res.statusCode = ' + pnx_res.statusCode,
        contextOut: [],
        source: 'poc_bookbot'
      });
    } else {
      /**
       * Prepare the data to return.
       */
      let speech = '';
      let pnx_result = JSON.parse(pnx_body);
      switch (pnx_result.info.total) {
        case 0:
          speech = 'I couldn\'t find any match... try rephrasing your search?';
          break;

        case 1:
          speech = 'Lucky you! There\'s exactly 1 match!';
          break;

        case 2:
        case 3:
          speech = `Yes! There are ${pnx_result.info.total} matches!`;
          break;

        default:
          speech = `Yes! There are (OMG) ${pnx_result.info.total} matches! These are the first 3...`;
      }
      /**
       * Format the message for Slack.
       */
      let slack_data = {
        text: speech,
        attachments: pnx_result.docs.map((x) => {
          /**
           * Determine the format and icon to display.
           */
          let thumb_url = 'https://github.com/smu-libraries/poc_bookbot/blob/master/q.png?raw=true';
          let format = 'Other';
          switch (x.type) {
            case 'book':
              thumb_url = 'https://github.com/smu-libraries/poc_bookbot/blob/master/e.png?raw=true';
              format = 'E-book';
              break;
            case 'pbook':
              thumb_url = 'https://github.com/smu-libraries/poc_bookbot/blob/master/p.png?raw=true';
              format = 'Book';
              break;
            case 'other':
              if (x.delivery.deliveryCategory.includes('Alma-P')) {
                thumb_url = 'https://github.com/smu-libraries/poc_bookbot/blob/master/m.png?raw=true';
                format = 'Media';
              }
              break;
          }

          /**
           * Prepare the fields to display.
           */
          let fields = [
            {
              title: 'Format',
              value: `\n${format}`,
              short: true
            }
          ];
          if (x.delivery.bestlocation) {
            let call_number = x.delivery.bestlocation.callNumber.replace(/(^\s*\(?)(.*?)(\s*\)\s*$)/, '$2');
            let library = 'Other';
            switch (x.delivery.bestlocation.libraryCode) {
              case 'MAIN':
                library = 'Li Ka Shing Library';
                break;
              case 'KGC':
                library = 'Kwa Geok Choo Law Library';
                break;
            }
            fields = fields.concat([
              {
                title: 'Call number',
                value: call_number,
                short: true
              },
              {
                title: 'Status',
                value: `Currently ${x.delivery.bestlocation.availabilityStatus} @ <https://lti.library.smu.edu.sg/map_it/v1/libraries/${x.delivery.bestlocation.libraryCode}/locations/${x.delivery.bestlocation.subLocationCode}/search/${call_number}?view=map|${library}: ${x.delivery.bestlocation.subLocation}>`,
                short: false
              }
            ]);
          }

          return {
            color: 'good',
            author_name: x.creator ? x.creator.join(', ') : 'Whodunnit?',
            title: x.title,
            title_link: x['@id'],
            text: x.publisher ? x.publisher.join(', ') : '',
            thumb_url: thumb_url,
            fields: fields
          };
        })
      };

      /**
       * Send the response to API.AI.
       */
      res.type('application/json');
      res.send({
        speech: speech,
        displayText: speech,
        data: {
          slack: slack_data
        },
        contextOut: [],
        source: 'poc_bookbot'
      });
    }
  });
});

app.listen(process.env.PORT || 3000);
