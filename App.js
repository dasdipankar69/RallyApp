Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    
    launch: function() {
        //Write app code here
        console.log("Hello world !!!");
        var mystore = Ext.create('Rally.data.wsapi.Store', {
            model: 'User Story',
            autoLoad: true,
            listeners: {
                load: function(mystore, data, success) {
                    //process data
                    console.log("StoreAndData :", mystore, data);
                    var mygrid = Ext.create('Rally.ui.grid.Grid', {
                        store:mystore,
                        columnCfgs: [
                             'FormattedID',
                             'Name',
                             'Owner'
                         ]});
                    console.log("MyGrid", mygrid);
                    this.add(mygrid);
                    console.log("this", this);
                },
                scope:this
                
            },
            fetch: ['Name', 'ScheduleState', 'FormattedID', 'Owner']
        });
    }
});
