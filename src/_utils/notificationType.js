import avro from 'avsc';

export default avro.Type.forSchema({
    type: 'record',
    fields: [
        {
            name: 'notificationType',
            type: 'string'
        },
        {
            name: 'message',
            type: 'string'
        },
        {
            name: 'username',
            type: 'string'
        },
        {
            name: 'type',
            type: 'string'
        },
        {
            name: 'from',
            type: 'string'
        }
        // {
        //     name: 'timestamp',
        //     type: 'string'
        // }
    ]
});