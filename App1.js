Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    
    name:undefined,
    owner:undefined,
    refinedEstimate:undefined,
    targetLaunch:undefined,
    
    launch: function() {
        //setting up the container for control layout.
        this.topContainer = Ext.create('Ext.container.Container',{
            layout: {
                type: 'vbox',
                align: 'left',
                padding: 10
            }
        });
        this.add(this.topContainer);
        
        this._loadIndustrySolutionsEpicData();
        
    },
    
    
    _loadIndustrySolutionsEpicData: function(){
            
        // If the store exists, just reload data
        if(this.myStore){
            this.myStore.load();
        }
        // else create the store
        else{
                this.myStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'PortfolioItem/Epic',
                fetch: ['Name', 'State', 'FormattedID', 'Owner', 'Tags', 'RefinedEstimate', 'c_TargetLaunch'],
                autoLoad: true,
                context: {
                    workspace: '/workspace/1089940415',
                    project: '/project/11656855707',
                    projectScopeUp: false,
                    projectScopeDown: true
                },
                listeners: {
                    load: function(myStore, data, success) {
                         this._populateCombobox(data);
                    },
                    scope:this
                },
                sorters: [
                            {
                                property: 'FormattedID',
                                direction: 'ASC'
                            }
                        ]
            });
        }
        
    },

        
    _populateCombobox: function(industrySolutionsEpicData){
        
        //get all the epic data for populating combobox.
        var comboBoxStore = this._getComboBoxStore(industrySolutionsEpicData);
        
        //create the combo dropdown list control.
        this.epicSelector = Ext.create('Ext.form.ComboBox',{
            fieldLabel:'Select Epics: ',
            itemId:'industryEpicCombobox',
            store: comboBoxStore,
            queryMode: 'local',
            displayField: 'Name',
            valueField: 'ID',
            width: 600,
            listeners: {
                select: this._onEpicComboSelect,
                ready: this._onEpicComboLoad, //need to revisit why this is not firing
                scope: this
			}
        });
        
        //add the combo box control to the app container.
        this.topContainer.add(this.epicSelector);
    },

    
    _onEpicComboLoad: function(){
        //required future implementation.
    },


    _onEpicComboSelect: function(){
        
        //retrive all epic info for selected item.
        var selectedEpic = this.down('#industryEpicCombobox').getValue();
        //console.log('Selected value?', selectedEpic);
        //this._loadSelectedEpicDetailsFromStore(selectedEpic);
        
        // Dipankar's code
        var records = []; 
        records = this.myStore.getRecords();
        var index = this.myStore.find('FormattedID', selectedEpic);
        this.name = records[index].get('Name');
        this.owner = records[index].get('Owner');
        this.refinedEstimate = records[index].get('RefinedEstimate');
        this.targetlaunch = records[index].get('c_TargetLaunch');

        console.log(this.name);
        
        
/*        Ext.Array.each(records, function(thisRecord) {
            // Returns the 
            var name = thisRecord.get('FormattedID');
            if(name === selectedEpic){
                this.name = thisRecord.get('Name');
                this.owner = thisRecord.get('Owner');
                this.refinedEstimate = thisRecord.get('RefinedEstimate');
                this.targetlaunch = thisRecord.get('c_TargetLaunch');
                console.log(selectedEpic + ":" + thisRecord.get('Name'));
                console.log(selectedEpic + ":" + thisRecord.get('Owner'));
                console.log(selectedEpic + ":" + thisRecord.get('RefinedEstimate'));
                console.log(selectedEpic + ":" + thisRecord.get('c_TargetLaunch'));
                return false;
            }
            
            
        }, this._onEpicComboSelect);
*/        
        
        this._loadEpicDetailsPanel();
    },




    _loadEpicDetailsPanel: function(){

        //if the epic panel already exists update the item values.
        if(this.epicDetailPanel)
        {
            console.log('update existing panel.');
            this.epicDetailPanel.getForm().findField('name').setValue(name);
            this.epicDetailPanel.getForm().findField('owner').setValue(owner);
            this.epicDetailPanel.getForm().findField('refined_estimate').setValue(refinedEstimate);
            this.epicDetailPanel.getForm().findField('target_launch').setValue(targetLaunch);
        }
        //else create the epic details panel and display the epic data.
        else
        {
            console.log('create new panel.');
            this.epicDetailPanel = Ext.create('Ext.form.Panel', {
                renderTo: Ext.getBody(),
                width: 500,
                height: 150,
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    padding: 10
                },
                title: 'Epic Details',
                items: [
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Name',
                    name: 'name',
                    value: this.name
                }, 
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Owner',
                    name: 'owner',
                    value: this.owner
                }, 
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Refined Estimate',
                    name: 'refined_estimate',
                    value: this.refinedEstimate
                }, 
                {
                    xtype: 'displayfield',
                    fieldLabel: 'Target Launch',
                    name: 'target_launch',
                    value: this.targetLaunch
                }]
            });
            
            //add the panel to the container.
            this.topContainer.add(this.epicDetailPanel);
        }
    },


    _getComboBoxStore: function(industrySolutionsEpicLoadData){
        //define the custom model for combo box data.
        Ext.define('Epic', {
                    extend: 'Ext.data.Model',
                    fields: [
                        {name: 'ID',  type: 'string'},
                        {name: 'Name', type: 'string'}
                    ]
                });
        
        //fetch the epic data for Combo list.
        var epicDataCol = [];
                
        Ext.Array.each(industrySolutionsEpicLoadData,function(thisIndustryEpic){
            var epicName = thisIndustryEpic.get('Name');
            var epicId = thisIndustryEpic.get('FormattedID');
            var epicComboName = epicId + ': ' + epicName;
            //console.log('Industry Epic = ', epicComboName);
            
            var epicData = Ext.create('Epic',{
                ID: epicId,
                Name: epicComboName
            });
            
            epicDataCol.push(epicData);
        });
        
        //create the store for the combo list.            
        var epicComboStore = Ext.create('Ext.data.Store',{
            model: 'Epic',
            data: epicDataCol,
            autoLoad: true
        });
        
        return epicComboStore;
    }

});
