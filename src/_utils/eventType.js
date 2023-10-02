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
            name: 'username',
            type: 'string'
        },
        {
            name: 'topic',
            type: 'string'
        }
        
        // {
        //     name: 'groupId',
        //     type: 'string'
        // },
        // {
        //     name: 'from',
        //     type: 'string'
        // },
        // {
        //     name: 'to',
        //     type: 'string'
        // },
        // {
        //     name: 'message',
        //     type: 'string'
        // },
        // {
        //     name: 'timestamp',
        //     type: 'string'
        // }
    ]
});