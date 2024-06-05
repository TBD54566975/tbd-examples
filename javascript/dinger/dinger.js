import { Web5 } from 'https://cdn.jsdelivr.net/npm/@web5/api@0.8.1/dist/browser.mjs';



const dingerProtocolDefinition = {
  'protocol': 'https://dinger.app/protocol',
  'published': true,
  'types': {
    'ding': {
      'schema': 'ding',
      'dataFormats': [
        'application/json'
      ]
    }
  },
  'structure': {
    'ding': {
      '$actions': [
        {
          'who': 'anyone',
          'can': 'write'
        },
        {
          'who': 'author',
          'of': 'ding',
          'can': 'read'
        },
        {
          'who': 'recipient',
          'of': 'ding',
          'can': 'read'
        }
      ]
    }
  }
};

const copyDidElement = document.querySelector('#copy-did');
const dingForm = document.querySelector('#ding-form');
const dingErrorElement = document.querySelector('#ding-error');
const dingProgressElement = document.querySelector('#ding-progress');
const dingedList = document.querySelector('#dinged-list');
const dingedByList = document.querySelector('#dinged-by-list');

const urlParams = new URLSearchParams(window.location.search);
const did = urlParams.get('did');
if (did) {
  document.querySelector('#did').value = did;
}

const { web5, did: myDid } = await Web5.connect();

await configureProtocol();

setInterval(async () => {
  await renderDings();
}, 2000);

copyDidElement.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(myDid);
  } catch (err) {
    alert('Failed to copy DID: ', err);
  }
});

if ('share' in navigator) {
  const shareDidElement = document.createElement('button');
  shareDidElement.id = 'share-did';
  shareDidElement.textContent = 'Share your DID';

  shareDidElement.addEventListener('click', async () => {    
    const { origin } = window.location;
        
    try {
      await navigator.share({
        title: 'Ding Me',
        text: "Reach me at: " + origin + "?did=" + myDid,  
        url: origin + "?did=" + myDid,      
      })
    } catch (err) {
      console.error('There was an error sharing:', err);
    }
  });


  const didButtonsElement = document.querySelector('#did-buttons');
  didButtonsElement.appendChild(shareDidElement);
}


dingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  dingErrorElement.textContent = '';
  dingProgressElement.textContent = '';

  const did = document.querySelector('#did').value;
  const note = document.querySelector('#note').value;

  if (did.length === 0) {
    dingErrorElement.textContent = 'DID required';
    return;
  }

  const ding = { dinger: myDid };
  if (note) {
    ding.note = note;
  }

  dingProgressElement.textContent = 'writing ding to local DWN...';

  try {
    const { record, status } = await web5.dwn.records.write({
      data: ding,
      message: {
        protocol: dingerProtocolDefinition.protocol,
        protocolPath: 'ding',
        schema: 'ding',
        recipient: did
      }
    });

    if (status.code !== 202) {
      dingErrorElement.textContent = `${status.code} - ${status.detail}`;
      return;
    }

    const shortenedDid = did.substr(0, 22);
    dingProgressElement.textContent = `Ding written locally! Dinging ${shortenedDid}...`;

    const { status: sendStatus } = await record.send(did);


    if (sendStatus.code !== 202) {
      console.log("Unable to send to target did:" + sendStatus);
      dingErrorElement.textContent = `${sendStatus.code} - ${sendStatus.detail}`;
      return;
    }

    dingProgressElement.textContent = `Dinged ${shortenedDid}!`;
  } catch (e) {
    dingErrorElement.textContent = e.message;
    return;
  }
});

async function configureProtocol() {
  const { protocols, status } = await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: 'https://dinger.app/protocol'
      }
    }
  });

  if (status.code !== 200) {
    alert('Failed to query protocols. check console');
    console.error('Failed to query protocols', status);

    return;
  }

  // protocol already exists
  if (protocols.length > 0) {
    console.log('protocol already exists');
  }

  // configure protocol on local DWN
  const { status: configureStatus, protocol } = await web5.dwn.protocols.configure({
    message: {
      definition: dingerProtocolDefinition
    }
  });
  console.log('configure protocol local status', configureStatus);

  // configure protocol on remote DWN, because sync may not have occured yet
  const { status: remoteConfigureStatus } = protocol.send(myDid);
  console.log('configure protocol remote status', remoteConfigureStatus);
}

async function renderDings() {
  // pull messages from local dwn. sync should automatically take care of pulling new messages from remote DWNs
  const { records, status } = await web5.dwn.records.query({
    message: {
      filter: {
        protocol: dingerProtocolDefinition.protocol
      },
      dateSort: 'createdDescending'
    }
  });

  if (status.code !== 200) {
    alert('Failed to query for dings. check console');
    console.error('Failed to query dings', status);

    return;
  }

  for (let record of records) {
    const recordExists = document.getElementById(record.id);
    if (recordExists) {
      continue;
    }

    const { dinger, note } = await record.data.json();

    // You Dinged:
    if (dinger === myDid) {
      const dingElement = document.createElement('li');
      dingElement.className = 'dinged-item'
      dingElement.id = record.id;

      const didElement = document.createElement('span');
      didElement.className = 'did';
      didElement.textContent = `${record.recipient.substr(0, 22)}...`;

      dingElement.appendChild(didElement);

      const timestampElement = document.createElement('span');
      timestampElement.className = 'timestamp';
      timestampElement.textContent = `${new Date(record.dateCreated).toLocaleString()}`;

      dingElement.appendChild(timestampElement);

      if (note) {
        const noteElement = document.createElement('span');
        noteElement.className = 'note';
        noteElement.textContent = `- ${note}`;
        dingElement.appendChild(noteElement);
      }

      const dingBackButton = document.createElement('button');
      dingBackButton.className = 'ding-back';
      dingBackButton.textContent = 'Ding agane';
      dingBackButton.dataset.toDing = record.recipient;

      dingBackButton.addEventListener('click', event => {
        const didInput = document.querySelector('#did');
        didInput.value = event.target.dataset.toDing;
      });

      dingElement.appendChild(dingBackButton);
      dingedList.appendChild(dingElement);
    } else {
      // Dinged By:
      const dingElement = document.createElement('li');
      dingElement.id = record.id;
      dingElement.className = 'dinged-item'

      const didElement = document.createElement('span');
      didElement.className = 'did';
      didElement.textContent = `${dinger.substr(0, 22)}...`;

      dingElement.appendChild(didElement);

      const timestampElement = document.createElement('span');
      timestampElement.className = 'timestamp';
      timestampElement.textContent = `${new Date(record.dateCreated).toLocaleString()}`;

      dingElement.appendChild(timestampElement);

      if (note) {
        const noteElement = document.createElement('span');
        noteElement.className = 'note';
        noteElement.textContent = `- ${note}`;
        dingElement.appendChild(noteElement);
      }

      const dingBackButton = document.createElement('button');
      dingBackButton.className = 'ding-back';
      dingBackButton.textContent = 'Ding Back';
      dingBackButton.dataset.toDing = dinger;

      dingBackButton.addEventListener('click', event => {
        const didInput = document.querySelector('#did');
        didInput.value = event.target.dataset.toDing;
      });

      dingElement.appendChild(dingBackButton);
      dingedByList.appendChild(dingElement);
    }
  }
}
