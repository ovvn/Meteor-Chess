FlowRouter.route("/",{
	name: "main",
	action(){
		//Blaze.renderWithData(Template.layout, {child: "main"}, document.body); //- тут были проблемы - при повторном попадании (нажатии ссылки Chess) весь код из template="layout" добавлялся в конец body
		
		BlazeLayout.render("layout", {child: "main"});
	}
	
});

FlowRouter.route("/users",{
	name: "users",
	action(){
	   BlazeLayout.render("layout", {child: "users"});
	}
	
});

FlowRouter.route("/games",{
	name: "games",
	action(){
	   BlazeLayout.render("layout", {child: "games"});
	}
});

FlowRouter.route("/games/:id", {
    name: "game",
    action(){
       BlazeLayout.render("layout", {child: "game"}); 
    }
});