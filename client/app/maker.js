let domoRenderer;
let domoForm;
let DomoFormClass;
let DomoListClass;

const handleDomo = (e) => {
  e.preventDefault();
  $("#domoMessage").animate({width:'hide'},350);
  
  if($("#domoName").val() == '' || $("domoAge").val() == '' || $("domoFood").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }
  
  sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
    domoRenderer.loadDomosFromServer();
  });
  
  return false;
};

/* Surely not a safe/good way to do this,
   but was what I could come up with */
const removeDomo = (name, age, food) => {
  $("#domoMessage").animate({width:'hide'},350);
  // get key value, not safe
  let key = $("#cs")[0].attributes.value.value;
  // data to send
  let data = `name=${name}&age=${age}&favFood=${food}&_csrf=${key}`;
  sendAjax('DELETE', '/removeDomo', data, function() {
    domoRenderer.loadDomosFromServer();
  });
  
  return false;
};

const renderDomo = function() {
  return (
    <form id="domoForm"
      onSubmit={this.handleSubmit}
      name="domoForm"
      action="/maker"
      method="POST"
      className="domoForm"
    >
    <label htmlFor="name">Name: </label>
    <input id="domoName" type="text" name="name" placeholder="Domo Name"/>
    <label htmlFor="age">Age:</label>
    <input id="domoAge" type="text" name="age" placeholder="Domo Age"/>
    <label htmlFor="favFood">Food:</label>
    <input id="domoFood" type="text" name="favFood" placeholder="Domo Favorite Food"/>
    <input type="hidden" name="_csrf" value={this.props.csrf} />
    <input className="makeDomoSubmit" type="submit" value="Make Domo"/>
    </form>
  );
};

const renderDomoList = function() {
  if(this.state.data.length === 0) {
    return (
      <div className="domoList">
      <h3 className="emptyDomo">No Domos yet</h3>
      </div>
    );
  }
  
  const domoNodes = this.state.data.map(function(domo) {
    return (
      <div key={domo._id} className="domo">
      <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace"/>
      <h3 className="domoName"> Name: {domo.name}</h3>
      <h3 className="domoAge"> Age: {domo.age}</h3>
      <h3 className="domoFood"> Food: {domo.favFood}</h3>
      <button onClick={() => { removeDomo(domo.name, domo.age, domo.favFood) }}>
    Remove
    </button>
    </div>
    );
  });
  
  return (
    <div className="domoList">
     <input type="hidden" id="cs" name="_csrf" value={this.props.csrf} />
    {domoNodes}
    </div>
  );
};

const setup = function(csrf) {
  DomoFormClass = React.createClass({
    handleSubmit: handleDomo,
    render: renderDomo,
  });
  
  DomoListClass = React.createClass({
    loadDomosFromServer: function() {
      sendAjax('GET', '/getDomos', null, function(data) {
        this.setState({data:data.domos});
      }.bind(this));
    },
    getInitialState: function() {
        return {data:[]};
    },
    componentDidMount: function() {
      this.loadDomosFromServer();
    },
    render: renderDomoList
  });
    domoForm = ReactDOM.render(
    <DomoFormClass csrf={csrf} />, document.querySelector("#makeDomo")
    );
  domoRenderer = ReactDOM.render(
    <DomoListClass csrf={csrf} />, document.querySelector("#domos")
  );
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});