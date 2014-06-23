Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    
    totalAcceptedLeafStoryCount: 0,
    totalLeafStoryCount: 0,
    consolidatedPercentDoneByStoryCount: 0,

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
            text: 'Filter',
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
                console.log(thisTagName);
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
                    model: 'PortfolioItem',
                    fetch: ['Name', 'State', 'FormattedID', 'Owner', 'Tags', 'AcceptedLeafStoryCount', 'LeafStoryCount'],
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
                            this._calculateConsolidatedPercentDoneByStoryCount();
                            this._updatePercentDone();
                        },
                        scope:this
                    },
                    filters: myTagFilters
                });
            }

        }

    },
    
    _calculateConsolidatedPercentDoneByStoryCount:function(){
        // Calculate the consolidated % done by story count
        var records = []; 
        records = this.myStore.getRecords();
        this.totalAcceptedLeafStoryCount = 0;
        this.totalLeafStoryCount = 0;
        Ext.Array.each(records, function(thisRecord) {
            // Returns the 
            var name = thisRecord.get('Name');
            this.totalAcceptedLeafStoryCount = this.totalAcceptedLeafStoryCount + parseInt(thisRecord.get('AcceptedLeafStoryCount'));
            this.totalLeafStoryCount = this.totalLeafStoryCount + parseInt(thisRecord.get('LeafStoryCount'));
        }, this);
        this.consolidatedPercentDoneByStoryCount = this.totalAcceptedLeafStoryCount/this.totalLeafStoryCount;
        console.log('consolidatedPercentDoneByStoryCount : ', this.consolidatedPercentDoneByStoryCount);

    },
    
    _updatePercentDone:function(){
        if(this.down('rallypercentdone')){
            console.log('Destroying progress bar');
            this.down('rallypercentdone').destroy();    
        }

        console.log('creating progress bar');
        this.topContainer.add({
            xtype: 'rallypercentdone',
            percentDone: this.consolidatedPercentDoneByStoryCount
        });
    }
    
    
});
