import avro from 'avsc';

export default avro.Type.forSchema({
    type: 'record',
    fields: [
        {
            name: 'groupId',
            type: 'string'
        },
        {
            name: 'message',
            type: 'string'
        },
        {
            name: "sender",
            type: 'string'
        },
        {
            name: 'receiver',
            type: 'string'
        },
        {
            name: 'type',
            type: 'string'
        },
        {
            name: 'timestamp',
            type: 'string'
        },
        {
            name: 'metadata',
            type: 'string'
        }
    ]
});