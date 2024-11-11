const { adminProperties } = require("../../resolvers/admin-properties");
const { adminUpdatePropertyTitle } = require("../../resolvers/admin-update-property-title");


async function generateAlias() {
    let rows  = await adminProperties()
    let ids = []  
    rows.forEach(el => {
      let alias = el.name.replace(/ /g,"_").replace("/","_").toLowerCase().substring(0,60);     
      ids.push({alias:alias, id:el.id}); 
    });
    let update_title = []
    for (let item of ids) {
      update_title.push(await adminUpdatePropertyTitle(null, {id:item.id, alias:item.alias}))
    }
    return update_title
}

module.exports = {
    generateAlias,
};
  