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
  let author_search = req.body.result.parameters.author? 'author,contains,' + req.body.result.parameters.author : '';
  let query = 'q=' + [title_search, subject_search, author_search].filter(Boolean).join(';');
  let limit = 'limit=3';
  let url = 'https://api-ap.hosted.exlibrisgroup.com/primo/v1/pnxs?' + [query, limit].join('&');

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
          speech = 'Hmmm... no good. Try rephrasing your search?';
          break;

        case 1:
          speech = 'Lucky you! There is exactly 1 hit!';
          break;

        case 2:
        case 3:
          speech = `Yes! There are ${pnx_result.info.total} hits!`;
          break;

        default:
          speech = `Yes! There are (OMG) ${pnx_result.info.total} hits! Here are the first 3...`;
      }
      /**
       * Format the message for Slack.
       */
      let slack_data = {
        text: speech,
        attachments: pnx_result.docs.map((x) => {
          return {
            color: '#36a64f',
            author_name: x.creator ? x.creator.join(', ') : 'Gee. Who wrote this?',
            title: x.title,
            title_link: x['@id'],
            text: 'An abstract comes here?',
            fields: [
              {
                title: 'Type',
                value: x['@TYPE'],
                short: true
              },
              {
                title: 'PNX ID',
                value: x.pnxId,
                short: true
              }
            ]
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
