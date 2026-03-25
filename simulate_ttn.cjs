const fetch = require('node-fetch');

const payload = {
    end_device_ids: {
        device_id: "eui-0004a30b00f310aa",
        dev_eui: "0004A30B00F310AA"
    },
    uplink_message: {
        decoded_payload: {
            "CO2": 563,
            "battery_voltage": 3.47,
            "device_id": "0004a30b00f310aa",
            "device_status": 1,
            "humidity": 33.48,
            "payload_type": 1,
            "payload_variant": 3,
            "presence": false,
            "temperature": 25.42
        },
        rx_metadata: [
            {
                rssi: -75
            }
        ],
        received_at: new Date().toISOString()
    }
};

async function testWebhook() {
    console.log('Sending test payload to https://eitel-getafe.vercel.app/api/webhook...');
    try {
        const response = await fetch('https://eitel-getafe.vercel.app/api/webhook', {
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
