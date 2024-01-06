import avro from 'avsc';
export default avro.Type.forSchema({
    type: 'record',
    fields: [
        {
            name: 'username',
            type: 'string'
        },
        {
            name: 'id',
            type: 'string'
        },
        {
            name: 'type',
            type: 'string'
        },
    ]
});
