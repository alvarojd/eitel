const fetch = require('node-fetch');

const payload = {
    end_device_ids: {
        device_id: "test-device-01"
    },
    uplink_message: {
        decoded_payload: {
            temperature: 22.5,
            humidity: 45.0,
            CO2: 850,
            battery_voltage: 3.5
        },
        rx_metadata: [
            {
                rssi: -75
            }
        ]
    }
};

async function testWebhook() {
    console.log('Sending test payload to http://localhost:3000/api/webhook...');
    try {
        const response = await fetch('http://localhost:3000/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWebhook();
