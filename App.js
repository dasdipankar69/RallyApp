Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    
    launch: function() {
        //Write app code here
        this.topContainer = Ext.create('Ext.container.Container',{
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        });
        this.add(this.topContainer);
        this._loadTagPicker();


    },
    
    _createGrid: function(store, data, success){
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
                    store:store,
                    columnCfgs: [
                         'FormattedID',
                         'Name',
                         'Owner',
                         'State',
                         'Tags'
                     ]});

        this.add(this.myGrid);
    },
    
    _loadTagPicker: function(){
        this.tagPicker = Ext.create('Rally.ui.picker.TagPicker', {
            width: 400,
            fieldLabel: "Tags: ",
            allowBlank: true,
            minHeight: 30,
            autoExpand: true,
        });
        this.topContainer.add(this.tagPicker);
        
        this.filterButton = Ext.create('Rally.ui.Button', {
            text: 'Fliter',
            handler: function() {
                this.tagPicker.collapse();
                this._loadData();
            },
            scope:this
        });
        this.topContainer.add(this.filterButton);
    },
    
    _loadData: function(){
        var selectedTagRecords = this.tagPicker._getRecordValue();
        // console.log("selectedTagRecords.length", selectedTagRecords.length);
        if (selectedTagRecords.length > 0) {

            var myTagFilters = [];

            Ext.Array.each(selectedTagRecords, function(thisTag) {
                var thisTagName = thisTag.get('Name');
                var thisFilter = {
                    property: 'Tags.Name',
                    operator: 'contains',
                    value: thisTagName
                };
                myTagFilters.push(thisFilter);
            });

            // If the store exists, just reload data
            if(this.myStore){
                this.myStore.setFilter(myTagFilters);
                this.myStore.load();
            }
            // else create the store
            else{
                    this.myStore = Ext.create('Rally.data.wsapi.Store', {
                    model: 'PortfolioItem/Epic',
                    fetch: ['Name', 'State', 'FormattedID', 'Owner', 'Tags'],
                    autoLoad: true,
                    context: {
                        workspace: '/workspace/1089940415',
                        project: '/project/11656852180',
                        projectScopeUp: false,
                        projectScopeDown: true
                    },
                    listeners: {
                        load: function(mystore, data, success) {
                            if (!this.myGrid) {
                                this._createGrid(this.myStore, data, success);
                            }
                        },
                        scope:this
                    },
                    filters: Rally.data.wsapi.Filter.or(myTagFilters)
                });
            }
            
        }

    }
    
});
