/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('../socrates/configure'); // initializing parameters
const R = require('ramda');
const beans = require('simple-configure').get('beans');

const persistence = beans.get('eventstorePersistence');

const really = process.argv[2];
const doSave = process.argv[3] === 'doSave';
if (!really || really !== 'really') {
  console.log('If you want to test the migration, append "really" to the command line.');
  console.log('If you really want to save, append "doSave" after "really" to the command line.');
  process.exit();
}

// merge event streams.
persistence.getByField({url: 'socrates-2016'}, (err, eventstore) => {
  if (err) {
    console.log(err);
    process.exit();
  }

  const events = eventstore.socratesEvents.concat(eventstore.registrationEvents).concat(eventstore.roomsEvents);
  const byTimestamp = (e1, e2) => e1.timestamp - e2.timestamp;
  eventstore.events = R.sort(byTimestamp, events);

  console.log(eventstore.events);
  console.log(eventstore.events.length + ' events.');

  if (doSave) {
    return persistence.save(eventstore, err1 => {
      if (err1) { console.log(err1); }
      process.exit();
    });
  }
});
