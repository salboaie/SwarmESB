/**
 * Created by salboaie on 3/24/15.
 */

 /*
 Swarm pentru administrarea organizatiilor usmed. Ofera constructorii create, delete, updateOrganisation, organisationsList
 */



var organisationCtrl =
{
    create:function(organisation){
        this.organisation = organisation;
        this.swarm('createOrganisation');
    },
    delete:function(organisationId){
        this.organisationId = organisationId;
        this.swarm('deleteOrganisation');
    },
    organisationsList:function(){
        this.swarm('doOrganisationsList');
    },
    update:function(organisationJson){
        this.organisationJson       = organisationJson;
        this.swarm('updateOrganisation');
    },
    createOrganisation:{
        node:"UsersManager",
        code: function() {
            var organisation = createOrganisation.async(this.organisation);
            var self = this;
            (function(organisation){
                console.log("AAAA", J(organisation));
                self.organisation = organisation;
                self.home("organisationCreationDone");
            }).swait(organisation, function(err){
                    self.err = err;
                    self.home("creationFailed");
                });
        }
    },
    deleteOrganisation:{
        node:"UsersManager",
        code: function() {
            deleteOrganisation(this.organisationId);
            this.home("organisationDeleted");
        }
    },
    updateOrganisation:{
        node:"UsersManager",
        code: function(){
            var organisation = updateOrganisation.async(this.organisationJson);
            var self = this;
            (function(organisation){
                self.organisation = organisation;
                self.home("organisationUpdateDone");
            }).swait(organisation);
        }
    },
    doOrganisationsList:{
        node:"UsersManager",
        code: function() {
            var organisationList = getOrganisations.async();
            var self = this;
            (function(organisationList){
                self.organisationList = organisationList;
                self.home("organisationsListDone");
            }).swait(organisationList);
        }
    }
};

organisationCtrl;

