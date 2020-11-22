import React from 'react';
import dayjs from 'dayjs';
import { Badge, Card, Col, Form } from 'react-bootstrap';

const data = require('../data/schedule.json');

var advancedFormat = require('dayjs/plugin/advancedFormat');
var objectSupport = require('dayjs/plugin/objectSupport');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone')
dayjs.extend(advancedFormat);
dayjs.extend(objectSupport);
dayjs.extend(utc);
dayjs.extend(timezone);

class SessionsPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      language: 'english',
      startTime: '09:00',
      endTime: '17:00',
      date: '2020-12-01',
      tags: this.getTags(),
      keyword: ''
    };
  }


  getLanguages() {
    return [ 'english', 'Chinese', 'French', 'Italian', 'Japanese', 'Korean', 'Portugese', 'Spanish' ];
  }

  getTags() {
    let allTags = [];
    for (let session of data.sessions) {
      let tags = session.tags.split(',');
      let hiddenTags = session.hiddenTags.split(',');

      for (let tag of tags) {
        if (this.isValidTag(tag) && !allTags.includes(tag)) {
          allTags.push(tag);
        }
      }

      for (let hiddenTag of hiddenTags) {
        if (this.isValidTag(hiddenTag) && !allTags.includes(hiddenTag)) {
          allTags.push(hiddenTag);
        }
      }
    }

    allTags.sort();

    return allTags;
  }

  isLanguage(language) {
    return this.getLanguages().includes(language);
  }

  isValidTag(tag) {
    // Ignore tags starting with __
    if (tag.startsWith('__')) {
      return false;
    }

    // Ignore languages
    if (this.isLanguage(tag)) {
      return false;
    }

    return true;
  }
  


  filterSessions() {
    let sessions = [];

    for (let session of data.sessions) {
      let tags = session.tags.split(',');
      let hiddenTags = session.hiddenTags.split(',');

      // Langauge Filter
      if (this.state.language) {
        if (!tags.includes(this.state.language) && !hiddenTags.includes(this.state.language)) {
          continue;
        }
      }

      // Date filter
      if (this.state.date) {
        let sessionStart = dayjs.unix(session.schedulingData.start.timestamp);
        if (!sessionStart.isSame(this.state.date, 'day')) {
          continue;
        }
      }

      // Time filter
      if (this.state.startTime && this.state.endTime) {
        let sessionStart = dayjs.unix(session.schedulingData.start.timestamp);

        let startTimeParts = this.state.startTime.split(':');
        let filterStart = dayjs({ year: sessionStart.year(), month: sessionStart.month(), day: sessionStart.date(), hour: startTimeParts[0], minute: startTimeParts[1] });

        let endTimeParts = this.state.endTime.split(':');
        let filterEnd = dayjs({ year: sessionStart.year(), month: sessionStart.month(), day: sessionStart.date(), hour: endTimeParts[0], minute: endTimeParts[1] });

        if (sessionStart.isBefore(filterStart) || sessionStart.isAfter(filterEnd)) {
          continue;
        }
      }

      // Tags filter
      let match = false;

      for (let selectedTag of this.state.tags) {
        if (tags.includes(selectedTag) || hiddenTags.includes(selectedTag)) {
          match = true;
        }
      }
      if (!match) continue;

      // Keyword filter
      if (this.state.keyword) {
        let re = new RegExp(this.state.keyword,"i");
        if (!session.name.match(re)) {
          continue;
        }
      }

      sessions.push(session);
    }

    return sessions;
  }

  listSessions() {
    let sessions = this.filterSessions();

    return sessions.map(session => {
      let sessionStart = dayjs.unix(session.schedulingData.start.timestamp);
      let sessionEnd = dayjs.unix(session.schedulingData.end.timestamp);

      return(
        <Card className="mb-3">
          <Card.Header>
            <Card.Title>{ session.name }</Card.Title>
            <Card.Subtitle>{ sessionStart.format('Do MMM HH:mm') } - { sessionEnd.format('HH:mm z') }</Card.Subtitle>
          </Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: session.description }} />
          </Card.Body>
          <Card.Footer>
              { session.tags.split(',').map(tag => {
                  if (this.isValidTag(tag)) {
                    return (<Badge variant="primary" className="mr-1">{ tag }</Badge>);
                  }
                })
              }
              { session.hiddenTags.split(',').map(tag => {
                  if (this.isValidTag(tag)) {
                    return (<Badge variant="secondary" className="mr-1">{ tag }</Badge>);
                  }
                })
              }
            </Card.Footer>
        </Card>
      )
    });
  }


  handleLanguageChange(event) {
    this.setState({
      language: event.target.value
    });
  }

  handleStartTimeChange(event) {
    this.setState({
      startTime: event.target.value
    });
  }

  handleEndTimeChange(event) {
    this.setState({
      endTime: event.target.value
    });
  }

  handleDateChange(event) {
    this.setState({
      date: event.target.value
    });
  }

  handleTagChange(event) {
    let tags = [];
    for (let option of event.target.selectedOptions) {
      tags.push(option.value);
    }
    
    this.setState({
      tags: tags
    });
  }

  handleKeywordChange(event) {
    this.setState({
      keyword: event.target.value
    });
  }


  /**
   * Renders the Marker component
   * @return {[type]} [description]
   */
  render() {
    return (
      <>
        <h1>Sessions</h1>

        <Form>
          <Form.Row>
            <Form.Group as={Col} md={8}>
              <Form.Label>Keyword</Form.Label>
              <Form.Control type="search" onChange={this.handleKeywordChange.bind(this)} multiple ></Form.Control>
            </Form.Group>

            <Form.Group as={Col} md={4}>
              <Form.Label>Tags</Form.Label>
              <Form.Control as="select" ref="tags" onChange={this.handleTagChange.bind(this)} multiple >
                { this.getTags().map(tag => ( <option>{ tag }</option> ) ) }
              </Form.Control>
            </Form.Group>
          </Form.Row>
          
          <Form.Row>
            <Form.Group as={Col} md={3}>
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" defaultValue="2020-12-01" onChange={ this.handleDateChange.bind(this)} />
            </Form.Group>
            
            <Form.Group as={Col} md={3}>
              <Form.Label>Start Time</Form.Label>
              <Form.Control type="time" defaultValue="09:00" onChange={ this.handleStartTimeChange.bind(this)} />
            </Form.Group>

            <Form.Group as={Col} md={3}>
              <Form.Label>End Time</Form.Label>
              <Form.Control type="time" defaultValue="17:00" onChange={ this.handleEndTimeChange.bind(this)}/>
            </Form.Group>

            <Form.Group as={Col} md={3}>
              <Form.Label>Language</Form.Label>
              <Form.Control as="select" ref="language" onChange={this.handleLanguageChange.bind(this)} >
                { this.getLanguages().map(lang => ( <option value={ lang }>{ lang.charAt(0).toUpperCase() + lang.slice(1) }</option> ) ) }
              </Form.Control>
            </Form.Group>
            
          </Form.Row>

        </Form>

          { this.listSessions(this.state.language) }
      </>
    );
  }
}
export default SessionsPage;