import React from 'react';
import dayjs from 'dayjs';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { Form } from 'react-bootstrap';

const data = require('../data/schedule.json');

var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat)

class SessionsPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      language: 'english',
      startTime: 9,
      endTime: 17,
      date: '2020-12-02'
    };
  }

  getLanguages() {
    return [ 'english', 'Spanish' ];
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
        if (sessionStart.format('H') < parseInt(this.state.startTime) || sessionStart.format('H') > parseInt(this.state.endTime)) {
          continue;
        }
      }

      sessions.push(session);
    }

    return sessions;
  }

  listSessions() {
    let sessions = this.filterSessions();
    console.log(sessions[0]);

    return sessions.map(session => {
      let sessionStart = dayjs.unix(session.schedulingData.start.timestamp);
      let sessionEnd = dayjs.unix(session.schedulingData.end.timestamp);

      return(
        <Card className="mb-3">
          <Card.Header>
            <Card.Title>{ session.name }</Card.Title>
            <Card.Subtitle>{ sessionStart.format('Do MMM HH:mm') } - { sessionEnd.format('HH:mm') }</Card.Subtitle>
          </Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: session.description }} />
          </Card.Body>
          <Card.Footer>
              { session.tags.split(',').map(tag => {
                  return (<Badge variant="primary" className="mr-1">{ tag }</Badge>);
                })
              }
              { session.hiddenTags.split(',').map(tag => {
                  return (<Badge variant="secondary" className="mr-1">{ tag }</Badge>);
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


  /**
   * Renders the Marker component
   * @return {[type]} [description]
   */
  render() {
    return (
      <>
        <h1>Sessions</h1>

        <Form>
          <Form.Group>
            <Form.Label>Language</Form.Label>
            <Form.Control as="select" ref="language" onChange={this.handleLanguageChange.bind(this)} >
              { this.getLanguages().map(lang => ( <option>{ lang }</option> ) ) }
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" defaultValue="2020-12-02" onChange={ this.handleDateChange.bind(this)} />
          </Form.Group>
          
          <Form.Group>
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" defaultValue="9" onChange={ this.handleStartTimeChange.bind(this)} />
            <Form.Control type="time" defaultValue="17" onChange={ this.handleEndTimeChange.bind(this)}/>
          </Form.Group>
        </Form>

          { this.listSessions(this.state.language) }
      </>
    );
  }
}
export default SessionsPage;