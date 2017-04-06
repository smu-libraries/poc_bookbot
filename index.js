/**
 * Hardcoded response for API.AI webhook calls.
 */

let express = require('express');
let body_parser = require('body-parser');
let app = express();

app.use(body_parser.json());

app.post('/bookbot/webhook', (req, res) => {
  /** Dump request from API.AI. */
  console.log(JSON.stringify(req.body, null, 2));

  res.type('application/json');
  res.send({
    /** Test response taken from example in API.AI documentation. */
    'speech': 'Barack Hussein Obama II is the 44th and current President of the United States.',
    'displayText': 'Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ',
    'data': {
      'slack': {
        'text': 'Today in San Francisco: Mostly Cloudy, the temperature is 66 F',
        'attachments': [
          {
            'title': 'Yahoo! Weather - San Francisco, CA, US',
            'title_link': 'http://www.yahoo.com',
            'color': '#36a64f',
            'fields': [
              {
                'title': 'Condition',
                'value': 'Temp 66 F',
                'short': 'false'
              },
              {
                'title': 'Wind',
                'value': 'Speed: 22, direction: 235',
                'short': 'true'
              },
              {
                'title': 'Atmosphere',
                'value': 'Humidity 61 pressure 1009.0',
                'short': 'true'
              }
            ],
            /**
             * 'thumb_url': '',
             */
            'callback_id': 'callback',
            /**
             * Test actions taken from example in Slack documentation.
             */
            'actions': [
              {
                'name': 'game',
                'text': 'Chess',
                'type': 'button',
                'value': 'action chess'
              },
              {
                'name': 'game',
                'text': 'Falken\'s Maze',
                'type': 'button',
                'value': 'action maze'
              },
              {
                'name': 'game',
                'text': 'Thermonuclear War',
                'style': 'danger',
                'type': 'button',
                'value': 'action war',
                'confirm': {
                  'title': 'Are you sure?',
                  'text': 'Wouldn\'t you prefer a good game of chess?',
                  'ok_text': 'Yes',
                  'dismiss_text': 'No'
                }
              }
            ]
          },
          /**
           * Test response taken from example in Slack documentation.
           */
          {
            'text': 'New comic book alert!',
            'title': 'The Further Adventures of Slackbot',
            'fields': [
              {
                'title': 'Volume',
                'value': '1',
                'short': true
              },
              {
                'title': 'Issue',
                'value': '3',
                'short': true
              }
            ],
            'author_name': 'Stanford S. Strickland',
            'author_icon': 'http://a.slack-edge.com/7f18https://a.slack-edge.com/bfaba/img/api/homepage_custom_integrations-2x.png',
            'image_url': 'http://i.imgur.com/OJkaVOI.jpg?1'
          },
          {
            'title': 'Synopsis',
            'text': 'After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy...'
          },
          {
            'fallback': 'Would you recommend it to customers?',
            'title': 'Would you recommend it to customers?',
            'callback_id': 'comic_1234_xyz',
            'color': '#3AA3E3',
            'attachment_type': 'default',
            'actions': [
              {
                'name': 'recommend',
                'text': 'Recommend',
                'type': 'button',
                'value': 'recommend'
              },
              {
                'name': 'no',
                'text': 'No',
                'type': 'button',
                'value': 'bad'
              }
            ]
          }
        ]
      }
    },
    'contextOut': [],
    'source': 'DuckDuckGo'
  });
});

app.listen(process.env.PORT || 3000);
