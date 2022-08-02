dojo.provide("unieapx.trace.MessageCenter");
dojo.require("unieap.form.BaseButton");
dojo.require("unieap.form.Button");
dojo.require("unieap.dialog.Dialog");
dojo.declare("unieapx.trace.MessageCenter", unieap.form.BaseButton,{
	
	templateString:
		"<a href='javascript:void(0);'>" +
			"<div dojoAttachPoint=\"iconNode\">"+
			"</div>"+
		"</a>",
	iconClass:"iconTrace",
		
	postCreate:function(){
		this.iconClass&&this.setIconClass(this.iconClass);
		this.connect(this.iconNode,'onclick',this.onClick);
	},
	onClick:function(){
		unieapx.dialog.TraceMessageBox.showTraceMessages();
	},
	setIconClass: function(className) {
		this.iconClass&&dojo.removeClass(this.iconNode,this.iconClass);
		dojo.addClass(this.iconNode,className);
		this.iconClass=className;
	}
	
});
dojo.require("unieap.dialog.DialogUtil");
dojo.require("unieap.global");
dojo.provide("unieapx.trace.TraceMessageBox");

unieapx.trace.TraceMessageBox = {
	
	showTraceMessages:function(){
		DialogUtil.showDialog({
			title : RIA_UNIEAPX_I18N.trace.infoList,
			width:"800",
			height:"500",
			url : unieap.WEB_APP_NAME+"/techcomp/ria/unieapx/trace/ShowTraceMessages.jsp"
		});
	}
};
dojo.provide("unieapx.query.Binding");

dojo.declare("unieapx.query.Binding", null, {
	
	/**
	 * @declaredClass:
	 * 		unieapx.query.Binding
	 * @summary:
	 * 		查询组件绑定数据源模块
	 * @example:
	 * 
	 * |<div dojoType="unieapx.query.Query" binding="{store:'empDs'}">
	 * |	...
	 * |</div>
	 *
	 */
	
	/**
	 * @summary:
	 * 		设置查询组件绑定的数据源。
	 * 
	 * @type:
	 * 		{unieap.ds.DataStore}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" binding="{store:'empDs'}">
	 * |	...
	 * |</div>
	 */
	store: "",
	
	//查询数据DataStore对象
	_bindingStore:null,
	
	constructor: function(param, inGrid) {
		dojo.mixin(this, param);
		if (param && param.store) {
			if (dojo.isString(param.store)) {
				this._bindingStore = unieap.getDataStore(param.store);
			} else {
				this._bindingStore = param.store;
			}
		}
		this._bindingStore = (this._bindingStore ||  new unieap.ds.DataStore(this.store));
	},
	
	/**
	 * @summary:
	 * 		获取查询组件绑定的DataStore
	 * @return:
	 * 		{unieap.ds.DataStore}
	 * @example:
	 * | 	unieap.byId("queryId").getBinding().getDataStore();
	 */
	getDataStore: function() {
		return this._bindingStore;
	},
	
	/**
	 * @summary:
	 * 		设置查询组件绑定的数据源。
	 * @example:
	 * |	var codeListFieldStore = new unieap.ds.DataStore("codeListFieldStore");
	 * |	var name = new unieap.ds.MetaData("name");
	 * |	name.setPrimaryKey(true);
	 * |	name.setDataType(12);
	 * |	name.setNullable(false);
	 * |	name.setLabel("名称");
	 * |	codeListFieldStore.addMetaData(name);
	 * |	codeListFieldStore.setRowSetName("com.neusoft.unieap.techcomp.codelist.entity.CodeListImpl");
	 * | 	unieap.byId("queryId").getBinding().setDataStore(codeListFieldStore);
	 */
	setDataStore: function(store) {
		this._bindingStore = store;
	}
	
});
dojo.provide("unieapx.query.Query");
dojo.require("unieap.ds");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.layout.ContentPane");
dojo.require("unieap.form.Button");
dojo.require("unieap.form.DateTextBox");
dojo.require("unieap.form.ComboBox");
dojo.require("unieap.form.CheckBox");
dojo.require("unieap.form.NumberTextBox");

dojo.require("unieapx.query.Binding");

dojo.declare("unieapx.query.Query", [dijit._Widget, dijit._Templated], {
	
	/**
	 * @declaredClass:
	 * 		unieapx.query.Query
	 * @summary:
	 * 		查询组件，根据绑定的实体类路径进行数据查询。<br>
	 * 			组件提供动态改变增删查询条件，设置最大条件数及查询前构造查询条件等功能。
	 * @example:
	 * 
	 * |<div dojoType='unieapx.query.Query'
	 * |		id='queryId' 
	 * |		binding="{store:'codeListFieldStore'}" 
	 * |		target="codeListGrid"
	 * |	 	maxDisplayCount="4" 
	 * |	 	pageSize="18"
	 * |		onChangeCondition="changeCodeListQueryHeight"
	 * |	 	buildQueryCondition="customBuilderQueryCondition">
	 * |</div>
	 *
	 */
	
    /**
     * @summary:
     *      查询结果集绑定目标对象ID值。
     * @type:
     *   {string}
     * @example:
     * |<div dojoType="unieapx.query.Query" target="queryResultGridId">
     * |</div>
     * 		上述代码表示:
     * 		点击查询按钮时，会将查询结果集绑定到id为queryResultGridId的组件上。
     * @default:
     *     ""
     */	
	target:"",
	/**
	 * @summary:
	 *     显示最多查询条件行数。
	 * @type:
	 *   {number}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" maxDisplayCount="8">
	 * |</div>
	 * 		上述代码表示:
	 * 		最多可显示8个查询条件。
	 * @default:
	 *     100
	 */	
	maxDisplayCount:100,
    /**
     * @summary:
     *     查询组件绑定数据源。
     * @type:
     *   {Object}
     * @example:
     * |<div dojoType="unieapx.query.Query" binding="{store:'codeListFieldStore'}">
     * |</div>
     * 		上述代码表示:
     * 		查询组件绑定数据源为codeListFieldStore。
     * @default:
     *     null
     */		
	binding:null,
    /**
     * @summary:
     *     显示样式。
     * @type:
     *   {Object}
     * @enum:
	 * 		{{mode:list}|{mode:form,columnCount:3}"}
     * @example:display
     * |<div dojoType="unieapx.query.Query" displayMode="{mode:form,columnCount:3}">
     * |</div>
     * 		上述代码表示:
     * 		页面查询条件采用form方式展现，每行显示3个查询条件。
     * @default:
     *     mode:list
     */		
	displayMode : {mode:'list'},
	
    /**
     * @summary:
     *     默认显示查询条件行数，默认显示1行。
     * @type:
     *   {number}
     * @example:
     * |<div dojoType="unieapx.query.Query" maxDisplayCount="2">
     * |</div>
     * 		上述代码表示:
     * 		页面默认显示两行查询条件。
     * @default:
     *     1
     */		
	displayCount : 1,
	/**
	 * @summary:
	 * 		是否显示“增加”、“删除”图标按钮。
	 * @description:
	 * 		如果为true表示显示，false表示不显示，默认值为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" showOperationWigdet="false">
	 * |</div>
	 * 		上述代码表示:
	 * 		页面不会显示“增加”、“删除”图标按钮。
	 * @default:
	 *     true
	 */
	showOperationWigdet:true,
	/**
	 * @summary:
	 * 		是否显示“查询”按钮。
	 * @description:
	 * 		如果为true表示显示，false表示不显示，默认值为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" showQueryWigdet="false">
	 * |</div>
	 * 		上述代码表示:
	 * 		页面不会显示“查询”按钮。
	 * @default:
	 *     true
	 */
	showQueryWigdet:true,
	/**
	 * @summary:
	 * 		是否显示“清空”按钮。
	 * @description:
	 * 		如果为true表示显示，false表示不显示，默认值为true。
	 * @type:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" showClearWigdet="false">
	 * |</div>
	 * 		上述代码表示:
	 * 		页面不会显示“清空”按钮。
	 * @default:
	 *     true
	 */
	showClearWigdet:true,
	/**
	 * @summary:
	 *     查询结果集绑定目标组件每页记录数，默认值为0，表示读取系统分页常数值。
	 *	   如果为-1，表示只有一页记录数。
	 * @type:
	 *   {number}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" pageSize="16">
	 * |</div>
	 * 		上述代码表示:
	 * 		目标组件每页记录数为16。
	 * @default:
	 *     10
	 */	
	pageSize:10,
	/**
	 * @summary:
	 *     设置查询控件排序条件。
	 *     其形式为sql中的排序条件,即order by后面部分，如"username desc, roleName"。
	 * @type:
	 *   {string}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" order="username desc, roleName">
	 * |</div>
	 * 		上述代码表示:
	 * 		目标组件查询结果按order值（username desc, roleName）进行排序。
	 * @default:
	 *     “”
	 */	
	order:"",
	/**
	 * @summary:
	 *     查询结果集附带查询条件dataStore的名称。<br/>
	 *     约束：queryStore名称不能与绑定的目标Store名称相同，否则将出现错误。
	 * @type:
	 *   {string}
	 * @example:
	 * |<div dojoType="unieapx.query.Query" queryStore="myQueryStore">
	 * |</div>
	 * 		上述代码表示:
	 * 		查询结果集附带查询条件dataStore的名称为myQueryStore，
	 * 		执行查询时，将把myQueryStore中的约束作为默认查询条件。
	 * @default:
	 *   "_queryStore"
	 */		
	queryStore:"_queryStore",
	// 默认查询结果DataStore名称。
	_queryResultStoreName:"_queryResultStore",
	//查询控件内部组件宽度。
	_widgetWidth:"100%",
	//整型条件类型提示信息。
	_integerMsg:RIA_UNIEAPX_I18N.query.integerPrompt,
	//查询组件查询条件实体名称。
	_rowsetName : "com.neusoft.unieap.techcomp.ria.query.dto.Condition",
	//存储查询条件及查询结果的DataCenter。
	_conditionDataCenter: new unieap.ds.DataCenter(),
	//查询条件DataStore对象
	_queryStore:null,
	
	_displayModelForm:'form',
	
    templateString: '<div>'+
						'<TABLE cellPadding="4" class="query_table" cellSpacing="4" dojoAttachPoint="tableNode"><tbody dojoAttachPoint="tbodyNode"></tbody>' +					
						'</TABLE>' +
					'</div>',
	postCreate: function() {
		//从页面dataCenter中获取条件DataStore对象。
		this._createControls();
	},
	reset:function(){
		var length = this.tableNode.rows.length;
		if(length){
			for(var i=0;i<length;i++){
				this.tableNode.deleteRow(0);
			}
		}
		this._createControls();
	},
	_createControls:function(){
		// -form
		if(this.displayMode.mode==this._displayModelForm){
			this._constructFormMode();
		}else{
		//-list
			if(this.displayCount>0){
				for(var i = 0;i < this.displayCount;i++){
					this._insertQueryRow(i);
				}
				if(this.displayCount == 1){
					this._disabledFirstRemoveImage();
				}
			}else{
				this._insertQueryRow(0);
				this._disabledFirstRemoveImage();
			}
		}
		this._initQueryClearDisplay();		
		if(!this.binding)
			return;
		if(!this.binding.store)
			return;
		var bindingStore = unieap.getDataStore(this.binding.store);
		this.getBinding().setDataStore(bindingStore);
	},
	_constructFormMode:function(){
		var metadata = this.getBinding().getDataStore().getMetaData();
		if(!metadata)
			return null;
		var codename = null;
		var codevalue = null;
		var tr  = this.tableNode.insertRow(this.tableNode.rows.length);
		var index = 1;
		var j = 0;
		var disc = this.displayMode.columnCount;
		this.displayMode.columnCount=disc&&disc>0?disc:3;
		for(var i=0;i<metadata.length;i++,index++,j++){
			if(index > this.displayMode.columnCount){
				tr  = this.tableNode.insertRow(this.tableNode.rows.length);
				index = 1;
				j=0;
			}
			codename = metadata[i].label?metadata[i].label:metadata[i].getName();
			var labelTd = tr.insertCell(index + j - 1);
			labelTd.innerHTML = codename+"&nbsp;<b>:</b>&nbsp";
			labelTd.setAttribute('noWrap','true'); 
			dojo.addClass(labelTd,"query_table_label");
			var widgetTd = tr.insertCell(index+j);
			var dataType = metadata[i].getDataType();	
			var valueWidget = this._getValueWidgetByType(dataType,metadata[i]);
			widgetTd.appendChild(valueWidget.domNode);
			//-匹配操作符
			var operation = this._getFormModeOption(dataType);
			valueWidget.queryConfig = {
									   column:metadata[i].getName(),
									   operation:operation,
									   dataType:dataType
								      };
		}
	},
	/**
	 * @summary:
	 * 		按条件进行数据查询。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.query();
	 */
	query:function(){
		//重新查询查询时，将翻页记录置回第一页
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			var resultStore = null;
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
   			if(resultStore){
   				resultStore.setPageNumber(1);
   			}
		}
		//准备查询条件
   		var queryConditionStore = this._prepareQueryConditionData();
   		if(queryConditionStore){
   			this._conditionDataCenter.addDataStore(this.queryStore,queryConditionStore);
   			this.doQuery(queryConditionStore,this.onComplete);
   		}
	},
	/**
	 * @summary:
	 * 		清空查询条件。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.clear();
	 */
	clear:function(){
		if(this.displayMode.mode==this._displayModelForm){
			var rowLength = this.tableNode.rows.length -1;
			for(var i=0;i<rowLength;i++){
				var cells = this.tableNode.rows[i].cells;
				for(var j=1;j<cells.length;j=j+2){
					var valueWidget = dijit.byNode(cells[j].childNodes[0]);
					valueWidget.setValue(null);
				}				
			}			
		}else{
			//先清空查询列表
			var rowLength = this.tableNode.rows.length;
			//去掉第一行查询部分以及最后一行按钮部分
			for(var i = 0 ;i < rowLength - 1;i++){
				var row = this.tableNode.rows[i];
				var columnWidget = this._getColumnWidgetByRow(row);
				var conditionWidget = this._getConditionWidgetByRow(row);
				var valueWidget = this._getValueWidgetByRow(row);
				//值控件
				var cell = row.cells[2];
				cell.removeChild(cell.childNodes[0]);
				var valueWidget = new unieap.form.TextBox();
				valueWidget.setWidth(this._widgetWidth);
				cell.appendChild(valueWidget.domNode);
				columnWidget.setValue(null);
				conditionWidget.setValue(null);
				conditionWidget.setDisabled(true);
				conditionWidget.getDataProvider().setDataStore(null);
				valueWidget.setDisabled(true);
				valueWidget.setValue(null);
			}
		}
		this._conditionDataCenter.removeDataStore (this.queryStore);
		
	},
	/**
	 * @summary:
	 * 		设置目标组件每页记录数大小。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.setPageSize(12);
	 */
	setPageSize:function(pageSize) {
		if(pageSize < 1)
			return;
   		this.pageSize = pageSize;
   	},
   	/**
	 * @summary:
	 * 		获取目标组件每页记录数大小。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.getPageSize();
	 */
	getPageSize:function() {
   		return this.pageSize;
   	},
   	/**
	 * @summary:
	 * 		设置目标组件排序字段。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.setOrder(name);
	 */
   	setOrder:function(order){
   		this.order = order;
   	},
   	/**
	 * @summary:
	 * 		获取目标组件排序字段。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.getOrder();
	 */
   	getOrder:function(){
   		return this.order;
   	},
   	/**
	 * @summary:
	 * 		设置目标组件ID值。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.setTarget("targetId");
	 */
   	setTarget:function(target) {
   		this.target = target;
   	},
   	/**
	 * @summary:
	 * 		获取目标组件ID值。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |queryObj.getTarget();
	 */
   	getTarget:function() {
   		return this.target;
   	},
   	/**
	 * @summary:
	 * 		获取查询组件绑定数据源。
	 * @example:
	 * |var queryObj=unieap.byId('queryId');
	 * |var bind = queryObj.getBinding();
	 * |bind.getDataStore();
	 */
   	getBinding:function(){
   		return unieap.getModuleInstance(this,"binding","unieapx.query.Binding");
   	},
   	
	/**
	 * @summary:
	 * 		设置默认查询条件数据源。
	 * @example:
	 * |	var queryStore = new unieap.ds.DataStore();
	 * |	var rowset = queryStore.getRowSet();
	 * | 	rowset.addRow({column:"codeListGroupId",operation:"E",dataType:12,value:selectedTreeId });
	 * |	unieap.byId("queryId").setQueryStore(queryStore);
	 */
   	setQueryStore:function(queryStore){
   		this._queryStore = queryStore;
   	},
   	/**
	 * @summary:
	 * 		获取默认查询条件数据源。
	 * @example:
	 * |	unieap.byId("queryId").getQueryStore();
	 */
   	getQueryStore:function(){
   		return this._prepareQueryConditionData();
   	},
   	/**
	 * @summary:
	 * 		执行翻页时，需要配合此方法使用，用以获取查询数据。
	 * @example:
	 * |	unieap.byId("queryId").descendPage(ds,_callback);
	 */
   	descendPage:function(ds,_callback){	
		var dataStore = this._getQueryData(ds);
		var dc = new unieap.ds.DataCenter();
		dc.addDataStore(dataStore);
		_callback(dc);
	},
	/**
	 * @summary:
	 * 		获取CodeList
	 * @example:
     * |<div dojoType="unieapx.query.Query" getCodeList="customGetCodeList">
     * |</div>
     * |function customGetCodeList(codeType){
     * | //...
     * |}
	 */
	getCodeList:function(codeType){
		return codeType;
	},
	/**
	 * @summary:
	 * 		执行查询事件实现，可以通过覆盖此方法实现自定义查询。
	 * @example:
     * |<div dojoType="unieapx.query.Query" doQuery="customDoQuery">
     * |</div>
     * |function customDoQuery(queryStore,onComplete){
     * | //...
     * |}
	 */
	doQuery:function(queryStore,onComplete){
		//准备target绑定的DataStore
		var resultStore = null;
   		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
   			if(resultStore){
   				if(resultStore.getName()){
   					this._queryResultStoreName = resultStore.getName();
   				}
   			}
		}
   		if(!resultStore)
   			resultStore = new unieap.ds.DataStore(this._queryResultStoreName);
   		//设置目标每页记录数
   		resultStore.setPageSize(this.pageSize);
		//根据查询条件执行查询
   		var resultDataStore = this._queryResultDataStore(queryStore , resultStore);
   		if (resultDataStore==null) 
   			return null;
   		this._conditionDataCenter.addDataStore(resultDataStore);
   		//执行回调方法
		onComplete(this._conditionDataCenter);
	},
	/**
	 * @summary:
	 * 		执行查询前准备查询条件事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" buildQueryCondition="customBuildQueryCondition">
     * |</div>
     * |function customBuildQueryCondition(queryStore){
     * | 	var rowset = queryStore.getRowSet();
	 * | 	rowset.addRow({column:"codeListGroupId",operation:"E",dataType:12,value:selectedTreeId });
     * |}
	 */
	buildQueryCondition:function(queryStore){
		return;
	},
	/**
	 * @summary:
	 * 		执行查询后处理查询结果事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" onComplete="customOnComplete">
     * |</div>
     * |function customOnComplete(dc){
     * | //...
     * |}
	 */
	onComplete:function(dc) {
		return;
	},
	/**
	 * @summary:
	 * 		执行查询后渲染目标组件事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" onRenderTarget="customonRenderTarget">
     * |</div>
     * |function onRenderTarget(ds){
     * | //...
     * |}
	 */
	onRenderTarget:function(resultStore){
		//将结果集绑定到目标组件上
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				widget.getBinding().setDataStore(resultStore);
   			}
		}
	},
	_callback:function(dc){
		return;
	},
	/**
	 * @summary:
	 * 		点击增加、删除图标按钮时触发事件。
	 * @example:
     * |<div dojoType="unieapx.query.Query" onChangeCondition="customOnChangeCondition">
     * |</div>
     * |function customOnChangeCondition(){
     * | 	unieap.byId("parentAd").notifyResize();
     * |}
	 */
	onChangeCondition:function(){
		return null;
	},
	
	//初始化查询、清空按钮。
	_initQueryClearDisplay:function(){
		var _tr  = this.tableNode.insertRow(this.tableNode.rows.length);
		var _td = _tr.insertCell(0);
		_td.setAttribute("align","right");
		if(this.displayMode.mode==this._displayModelForm){
			_td.setAttribute("colSpan",this.tableNode.rows[0].cells.length);
		}else{
			_td.setAttribute("colSpan",3);
		}
		if(this.showOperationWigdet&&this.displayMode.mode!=this._displayModelForm){
			var tmpTd = _tr.insertCell(1);
			tmpTd.setAttribute("colSpan",2);
		}
		if(this.showQueryWigdet && this.showClearWigdet){
			var _div = document.createElement("div");
			dojo.addClass(_div,"query_buttons");
			var queryButton = new unieap.form.Button();
			var clearButton = new unieap.form.Button();
			queryButton.setLabel(RIA_UNIEAPX_I18N.query.queryLabel);
			clearButton.setLabel(RIA_UNIEAPX_I18N.query.clearLabel);
			_div.appendChild(queryButton.domNode);
			_div.appendChild(clearButton.domNode);
			_td.appendChild(_div);
			dojo.connect(queryButton,"onClick",this,this._doQuery)
			dojo.connect(clearButton,"onClick",this,this._doClear)
		}else if(this.showQueryWigdet){
			var _div = document.createElement("div");
			dojo.addClass(_div,"query_buttons");
			var queryButton = new unieap.form.Button();
				queryButton.setLabel(RIA_UNIEAPX_I18N.query.queryLabel);
				_div.appendChild(queryButton.domNode);
				_td.appendChild(_div);
			dojo.connect(queryButton,"onClick",this,this._doQuery)
		}else if(this.showClearWigdet){
			var _div = document.createElement("div");
			dojo.addClass(_div,"query_buttons");
			var clearButton = new unieap.form.Button();
				clearButton.setLabel(RIA_UNIEAPX_I18N.query.clearLabel);
				_td.appendChild(_div);
				
			dojo.connect(clearButton,"onClick",this,this._doClear)
		}
	},
	//向table中增加一个行记录。
	_insertRow:function(tableNode,index){
		return tableNode.insertRow(index);
	},
	//增加一个查询条件记录。
	_insertQueryRow:function(index){
		var _this = this;
		var queryRow = this._insertRow(this.tableNode,index);
		//向table第一个单元格插入查询列下拉列表
		var columnBox = new unieap.form.ComboBox();
		var columnBoxStore = this._configColumnBoxStore();
		var columnBoxTd = queryRow.insertCell(0); 
			columnBox.setWidth(this._widgetWidth);
			columnBox.getDataProvider().setDataStore(columnBoxStore);
			columnBox.setReadOnly(true);
			columnBoxTd.setAttribute("width","40%");
			columnBoxTd.appendChild(columnBox.domNode);	
		dojo.connect(columnBox,"onChange",function(){_this._columnBoxOnChange(columnBox)})
		//向table第二个单元格插入查询条件下拉列表
		var conditionBox = new unieap.form.ComboBox();
		var conditionTd = queryRow.insertCell(1); 
			conditionBox.setWidth(this._widgetWidth);
			conditionBox.getDataProvider().setDataStore(null);
			conditionBox.setReadOnly(true);
			conditionBox.setDisabled(true);
			conditionTd.setAttribute("width","120px");
			conditionTd.appendChild(conditionBox.domNode);
		//向table第三个单元格插入文本输入域
		var valueBox = new unieap.form.TextBox();
		var valueTd = queryRow.insertCell(2); 
			valueBox.setWidth(this._widgetWidth);
			valueTd.setAttribute("width","auto");
			valueTd.appendChild(valueBox.domNode);
			valueBox.setDisabled(true);
		//分别向table第四、五单元格插入增加、删除条件图标
		if (this.showOperationWigdet) {
			//增加查询条件图标
			var addImage = document.createElement("SPAN");
			var add_Td = queryRow.insertCell(3); 
				addImage.className = "query-add";
				add_Td.setAttribute("width","16px");
				add_Td.appendChild(addImage);
			//删除查询条件图标
			var removeImage = document.createElement("SPAN");
			var remove_Td = queryRow.insertCell(4);
				removeImage.className = "query-delete";
				remove_Td.setAttribute("width","16px");
				remove_Td.appendChild(removeImage);
				
			dojo.connect(addImage,"onclick",function(){_this._addNewRowOnClick(addImage)});
			dojo.connect(removeImage,"onclick",function(){_this._removeRowOnClick(removeImage)});
		}
	},
	//根据查询数据Store配置查询下拉列表数据。
	_configColumnBoxStore:function(){
		if(!this.getBinding().getDataStore())
			return null;
		var metadata = this.getBinding().getDataStore().getMetaData();
		if(!metadata)
			return null;
		var conditionStore = new unieap.ds.DataStore();
		var rowset = conditionStore.getRowSet();
		var codename = null;
		var codevalue = null;
		for(var i=0;i<metadata.length;i++){
			codevalue = metadata[i].name;
			codename = metadata[i].label?metadata[i].label:codevalue;
			rowset.addRow({CODENAME:codename,CODEVALUE:codevalue});
		}
		return conditionStore;
	},
	//查询按钮点击事件绑定方法。
	_doQuery:function(){
		this.query();
	},
	//清空按钮点击事件绑定方法。
	_doClear:function(){
		this.clear();
	},
	//增加图标按钮点击事件绑定方法。
	_addNewRowOnClick:function(cell){
		var rowLength = this.tableNode.rows.length;
		if(this.showQueryWigdet || this.showClearWigdet){
			if(rowLength > this.maxDisplayCount)
				return;
		}else{
			if(rowLength > this.maxDisplayCount - 1){
				return;
			}
		}
		this._enabledFirstRemoveImage();
		var rowIndex = cell.parentNode.parentNode.rowIndex;
		this._insertQueryRow(cell.parentNode.parentNode.rowIndex+1);
		this.onChangeCondition();
	},
	//删除图标按钮点击事件绑定方法。
	_removeRowOnClick:function(cell){
		var rowIndex = cell.parentNode.parentNode.rowIndex;
		this.tableNode.deleteRow(rowIndex);
		this._disabledFirstRemoveImage();
		this.onChangeCondition();
	},
	//根据查询条件返回查询结果数据。
   	_getQueryData: function(resultStore) {
		var queryConditionStore = this._prepareQueryConditionData();
		if(queryConditionStore){
			this._conditionDataCenter.addDataStore(this.queryStore,queryConditionStore);
	   		return this._queryResultDataStore(queryConditionStore,resultStore);
		}
		return null;
   	}, 
   	//根据查询条件与查询结果集返回查询结果数据。
   	_queryResultDataStore:function(queryStore , resultStore){
   	//如果没有配置entityClass属性，则从store中取得实体class。
		var rowSetName = null;
		if(this.getBinding().getDataStore())
			rowSetName = this.getBinding().getDataStore().getRowSetName();
   		if (!rowSetName) {
   			rowSetName = resultStore.getRowSetName();
   		}
   		if(!rowSetName){
   			dojo.require("unieap.dialog.MessageBox");
   			MessageBox.alert({
   				title : RIA_I18N.dialog.messageBox.promptDialog,
   				type : 'warn',
   				message : RIA_UNIEAPX_I18N.query.queryMessage
   			});
   			return null;
   		}
   		resultStore.setRowSetName(rowSetName);
   		var paramDC = new unieap.ds.DataCenter();
   		paramDC.addDataStore(queryStore);
   		paramDC.addDataStore(resultStore);
   		var dc = new unieap.ds.DataCenter();
   		this.doQueryRequestData(paramDC,rowSetName,this._queryResultStoreName,this.queryStore,dc);
   		if (dc instanceof unieap.ds.DataCenter) {
			var resultStore = dc.getDataStore(this._queryResultStoreName);
			if(resultStore){
				var name = resultStore.getName();
				var timeStamp = dc.getParameter(name);
				//添加resultStore到全局dataCenter中
				unieap.setDataStore(resultStore,dataCenter,true,timeStamp);
			}
			this.onRenderTarget(resultStore);
			return resultStore;
		} else 
			return null;
   	},
   	doQueryRequestData:function(paramDC , rowSetName, queryResultStoreName , queryStore, retDc){
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQuery.action";
		var dc = unieap.Action.requestData({
			url:path,
			parameters:
				{
					"_entityClass":rowSetName,
					"_queryResultStore":queryResultStoreName,
					"_queryConditionStore":queryStore
				},
			sync:true,
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
		var ds = dc.getSingleDataStore();
		if(ds){
			var name = ds.getName();
			var timeStamp = dc.getParameter(name);
			unieap.setDataStore(ds,retDc,true,timeStamp);
		}
   	},
   	//重新复制查询条件DataStore。
	_copyQueryCoditionStore:function(){
		var store = this._queryStore;
		if(!store){
			store = dataCenter.getDataStore(_this.queryStore);
		}
		if(!store){
			return null;
		}
		var tmpStore = unieap.revDS(store);
			tmpStore.setName(_this.queryStore);
		return tmpStore;
	},
	//准备全部查询条件数据。
	_prepareQueryConditionData:function() {
		//去掉第一行查询部分以及最后一行按钮部分
		_this = this;
		var tmpQueryStore = _this._copyQueryCoditionStore();
		if(!tmpQueryStore && _this.queryStore)
			tmpQueryStore = new unieap.ds.DataStore(_this.queryStore);
		//解的查询组件条件数据。
		var tmpRowSetName = _this._rowsetName;
		tmpQueryStore.setRowSetName(tmpRowSetName);
		var rowset = tmpQueryStore.getRowSet();
		var rowLength = _this.tableNode.rows.length;
		//form mode
		if(this.displayMode.mode==this._displayModelForm){
			for(var i=0;i<rowLength-1;i++){
				var cells = this.tableNode.rows[i].cells;
				for(var j=1;j<cells.length;j=j+2){
					var valueWidget = dijit.byNode(cells[j].childNodes[0]);
					//输入不合法数据时提示
					if(!valueWidget.getValidator().validate()){
						dojo.require("unieap.dialog.MessageBox");
			   			MessageBox.alert({
			   				title : RIA_I18N.dialog.messageBox.promptDialog,
			   				type : 'warn',
			   				message : this._integerMsg
			   			});
			   			return null;
					}
					var value = valueWidget.getValue();
					if(value){
						if(valueWidget instanceof unieap.form.ComboBoxTree){
							var metadata = this.getBinding().getDataStore().getMetaData(valueWidget.queryConfig.column);
							if(metadata.config.treeJson && !metadata.config.treeJson.loader){
								value = valueWidget.getTree().getCurrentNode().item.data.CODEVALUE;
							}
						}
						valueWidget.queryConfig.value = value;
						rowset.addRow(valueWidget.queryConfig);
					}
				}				
			}
		}else{
			for(var i=0;i<rowLength -1;i++){
				var row = this.tableNode.rows[i];
				var conditionWidget = this._getConditionWidgetByRow(row);
				if(!conditionWidget.getValue()){
					continue;
				}
				var columnWidget = this._getColumnWidgetByRow(row);
				if(!columnWidget.getValue()){
					continue;
				}
				var valueWidget = this._getValueWidgetByRow(row);
				//输入不合法数据时提示
				if(!valueWidget.getValidator().validate()){
					dojo.require("unieap.dialog.MessageBox");
		   			MessageBox.alert({
		   				title : RIA_I18N.dialog.messageBox.promptDialog,
		   				type : 'warn',
		   				message : this._integerMsg
		   			});
		   			return null;
				}
				var value = valueWidget.getValue();
				if (value){
					var metadata = this.getBinding().getDataStore().getMetaData(columnWidget.getValue());
					if(valueWidget instanceof unieap.form.ComboBoxTree && metadata.config.treeJson && !metadata.config.treeJson.loader){
						value = valueWidget.getTree().getCurrentNode().item.data.CODEVALUE;
					}
					rowset.addRow({column:columnWidget.getValue(),
						   operation:conditionWidget.getValue(),
						   dataType:metadata.getDataType(),
						   value:value});
				}
			}
		}
		//设置查询排序条件
		tmpQueryStore.setOrder(this.order);
		//构造用户条件
		this.buildQueryCondition(tmpQueryStore);
		return tmpQueryStore;
	},
	//禁用只有一条查询条件的删除图标按钮。
	_disabledFirstRemoveImage:function(){
		var rowLength = this.tableNode.rows.length;
		if((((this.showQueryWigdet || this.showClearWigdet) && rowLength == 2)
				|| rowLength == 1) && this.showOperationWigdet){
			var row = this.tableNode.rows[0];
			var removeCell = row.cells[4];
			var removeDisabledImage = document.createElement("SPAN");
			removeDisabledImage.className = "query-delete-disabled";
				removeCell.removeChild(removeCell.childNodes[0]);
				removeCell.appendChild(removeDisabledImage);
		}
	},
	//使被禁用的删除图标按钮可用。
	_enabledFirstRemoveImage:function(){
		var rowLength = this.tableNode.rows.length;
		var _this = this;
		if(((_this.showQueryWigdet ||_this.showClearWigdet) && rowLength == 2)
				|| rowLength == 1){
			var row = _this.tableNode.rows[0];
			var removeCell = row.cells[4];
			var removeImage = document.createElement("SPAN");
				removeImage.className = "query-delete";
				removeCell.removeChild(removeCell.childNodes[0]);
				removeCell.appendChild(removeImage);
			dojo.connect(removeImage,"onclick",function(){_this._removeRowOnClick(removeImage)});
		}
	},
	//条件数据下拉列表变化时绑定方法。
	_columnBoxOnChange:function(box){
		if(box.getValue()){
			this._setConditionAvailable(box);
		}
	},
	//获取条件数据下拉列表组件。
	_getColumnWidgetByRow:function(row){
		return dijit.byNode(row.cells[0].childNodes[0]);
	},
	//将条件输入框设置为可用并设置可选的值。
	_setConditionAvailable:function(box){
		var conditionBox = this._getConditionWidget(box);
		var value = box.getValue();
		var metadata = this.getBinding().getDataStore().getMetaData(value);
		var dataType = metadata.getDataType();
		var conditionDataStore = this._getConditionStoreByType(dataType);
		conditionBox.setDisabled(false);
		conditionBox.getDataProvider().setDataStore(conditionDataStore);
		//条件store一定大于0条
		conditionBox.getDataProvider().setSelectedItemsByIndex(0);
		this._displayValueWidget(box,dataType,metadata);
	},
	
	//根据单元格对象获取条件编辑下拉列表组件。
	_getConditionWidget:function(box){
		var conditionNode = box.domNode.parentNode.parentNode.cells[1].childNodes[0];
		return dijit.byNode(conditionNode);
	},
	//根据行对象获取条件编下拉列表组件。
	_getConditionWidgetByRow:function(row){
		return dijit.byNode(row.cells[1].childNodes[0]);
	},
	//根据单元格对象获取值编下拉列表组件。
	_getValueWidget:function(box){
		var valueNode = this._getValueWidgetCell(box).childNodes[0];
		return dijit.byNode(valueNode);		
	},
	//据单元格对象获取值编下拉列表组件。
	_getValueWidgetCell:function(box){
		return box.domNode.parentNode.parentNode.cells[2];
	},
	//根据行对象获取值编下拉列表组件。
	_getValueWidgetByRow:function(row){
		return dijit.byNode(row.cells[2].childNodes[0]);
	},
	//使条件编辑下拉列表组件可用。
	_displayValueWidget:function(box,dataType,metadata){
		var widget = this._getValueWidgetByType(dataType,metadata);
		var cell = this._getValueWidgetCell(box);
		cell.removeChild(cell.childNodes[0]);
		cell.appendChild(widget.domNode);
		widget.setValue(null);
		widget.setDisabled(false);
	},	
	//根据数据类型获取条件编辑列表数据。
	_getConditionStoreByType:function(dateType){
		var store = null;
		switch(dateType){
			case unieap.DATATYPES.BIGINT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.BOOLEAN :
				store = this._construtBooleanDataStore();
				break;
			case unieap.DATATYPES.DATE :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.DECIMAL :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.DOUBLE :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.FLOAT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.INTEGER :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.LONGVARCHAR :
				store = this._construtStringDataStore();
				break;
			case unieap.DATATYPES.NUMERIC :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.REAL :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.SMALLINT :
				store = this._construtNumberDataStore();
				break;			
			case unieap.DATATYPES.STRING :
				store = this._construtStringDataStore();
				break;
			case unieap.DATATYPES.TIME :
				store = this._construtNumberDataStore();
				break;		
			case unieap.DATATYPES.TIMESTAMP :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.TINYINT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.VARCHAR :
				store = this._construtStringDataStore();
				break;																	
			default :
				store = this._construtStringDataStore();
		}
		return store;
	},
	//根据数据类型获取组件对象。
	_getValueWidgetByType:function(dateType,metadata){
		//debugger;
		var widget = null;
		if(metadata.config && metadata.config.type){
			if(metadata.config.type == 'list'){
				widget = this._createSelectedWidget(metadata);
				return widget;
			}else if(metadata.config.type == 'tree'){
				widget = this._createComboBoxTreeWidget(metadata);
				return widget;
			}
		}
		switch(dateType){
			case unieap.DATATYPES.BIGINT :
				widget = this._createNumberWidget();
				widget.range={allowDecimal:false};
				widget.getValidator().setErrorMsg(this._integerMsg); 
				break;
			case unieap.DATATYPES.BOOLEAN :
				widget = this._createStringWidget();
				break;
			case unieap.DATATYPES.DATE :
				widget = this._createDateWidget();
				break;
			case unieap.DATATYPES.DECIMAL :
				widget = this._createNumberWidget();
				break;
			case unieap.DATATYPES.DOUBLE :
				widget = this._createNumberWidget();
				break;
			case unieap.DATATYPES.FLOAT :
				widget = this._createNumberWidget();
				break;
			case unieap.DATATYPES.INTEGER :
				widget = this._createNumberWidget();
				widget.range={allowDecimal:false};
				widget.getValidator().setErrorMsg(this._integerMsg); 
				break;
			case unieap.DATATYPES.LONGVARCHAR :
				widget = this._createStringWidget();
				break;
			case unieap.DATATYPES.NUMERIC :
				widget = this._createNumberWidget();
				break;
			case unieap.DATATYPES.REAL :
				widget = this._createNumberWidget();
				break;
			case unieap.DATATYPES.SMALLINT :
				widget = this._createNumberWidget();
				widget.range={allowDecimal:false};
				widget.getValidator().setErrorMsg(this._integerMsg); 
				break;			
			case unieap.DATATYPES.STRING :
				widget = this._createStringWidget();
				break;
			case unieap.DATATYPES.TIME :
				widget = this._createDateWidget();
				break;		
			case unieap.DATATYPES.TIMESTAMP :
				widget = this._createTimestampWidget();
				break;
			case unieap.DATATYPES.TINYINT :
				widget = this._createNumberWidget();
				widget.range={allowDecimal:false};
				widget.getValidator().setErrorMsg(this._integerMsg); 
				break;
			case unieap.DATATYPES.VARCHAR :
				widget = this._createStringWidget();
				break;
			default :
				widget = this._createStringWidget();
		}
		return widget;
	},
	//构造字符类型列对应条件DataStore。
	_construtStringDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"M",CODENAME:RIA_UNIEAPX_I18N.query.stringMatch});
		rowset.addRow({CODEVALUE:"LM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftMatch});
		rowset.addRow({CODEVALUE:"RM",CODENAME:RIA_UNIEAPX_I18N.query.stringRigthMatch});
		rowset.addRow({CODEVALUE:"NM",CODENAME:RIA_UNIEAPX_I18N.query.stringNotMatch});
		rowset.addRow({CODEVALUE:"NLM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftNotMatch});
		rowset.addRow({CODEVALUE:"NRM",CODENAME:RIA_UNIEAPX_I18N.query.stringRightNotMatch});
		return stringDataStore;
	}, 	
	//构造数字类型列对应条件DataStore。
	_construtNumberDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		rowset.addRow({CODEVALUE:"G",CODENAME:RIA_UNIEAPX_I18N.query.numberGreaterThan});
		rowset.addRow({CODEVALUE:"S",CODENAME:RIA_UNIEAPX_I18N.query.numberLessThan});
		rowset.addRow({CODEVALUE:"GE",CODENAME:RIA_UNIEAPX_I18N.query.numberGreaterThanOrEquals});
		rowset.addRow({CODEVALUE:"SE",CODENAME:RIA_UNIEAPX_I18N.query.numberLessThanOrEquals});
		return stringDataStore;
	},
	//构造布尔类型列对应条件DataStore。
	_construtBooleanDataStore:function(){
		var booleanDataStore = new unieap.ds.DataStore();
		var rowset = booleanDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return booleanDataStore;
	},
	//构造字符类型组件。
	_createStringWidget:function(){
		var widget = new unieap.form.TextBox({trim:true});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	//构造数字类型组件。
	_createNumberWidget:function(){
		var widget = new unieap.form.NumberTextBox();
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	//构造下拉列表类型组件。 edit by muxg
	_createSelectedWidget:function(metadata){
		if(!metadata.config){
			return this._createStringWidget();
		}
		var dataProvider = {};
		if(metadata.config.store){
			if(dataCenter.getDataStore(metadata.config.store)){
				dataProvider.store = metadata.config.store;
			}
		}
		if(!dataProvider || !dataProvider.prototype){
			dataProvider.store = this.getCodeList(metadata.config.store);
		}
		var decoder = {displayAttr:metadata.config.displayAttr||'CODENAME',valueAttr:metadata.config.valueAttr||'CODEVALUE'};
		var widget = new unieap.form.ComboBox({readOnly:true,dataProvider:dataProvider,decoder:decoder});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	
	
	//构造下拉树类型组件。 
	_createComboBoxTreeWidget:function(metadata){
		if(!metadata.config){
			return this._createStringWidget();
		}
		var widget = null;
		//构造来自代码表中下拉树
		if(metadata.config.treeJson && !metadata.config.treeJson.loader){
			var storeName = metadata.config.treeJson.binding.store;
			var ds = unieap.Action.getCodeList(storeName);
			if(ds){
				dataCenter.addDataStore(ds);
			}
			widget = new unieap.form.ComboBoxTree({
				readOnly:metadata.config.readOnly?metadata.config.readOnly:true,
				required:metadata.config.required?metadata.config.required:false,
				dataProvider:metadata.config.dataProvider,
				treeJson:{
					binding:{
						store:storeName,
						id:'ID',
						code:'CODEVALUE',
						label:'CODENAME',
						leaf:'leaf',
						parent:'PARENTID',
						query:{name:'PARENTID',relation:'=',value:'-1'}
					}
				},
					popup:metadata.config.popup,
					expandTree:metadata.config.expandTree
				});
		}else{
			//构造自定义下拉树
			widget = new unieap.form.ComboBoxTree({
				readOnly:metadata.config.readOnly?metadata.config.readOnly:true,
				required:metadata.config.required?metadata.config.required:false,
				dataProvider:metadata.config.dataProvider,
				treeJson:{
					loader:metadata.config.treeJson?metadata.config.treeJson.loader:metadata.config.treeJson,
					binding:metadata.config.treeJson?metadata.config.treeJson.binding:metadata.config.treeJson
				},
				popup:metadata.config.popup,
				expandTree:metadata.config.expandTree
			});
		}
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	
	
	
	
	
	//构造日期类型组件。
	_createDateWidget:function(){
		var widget = new unieap.form.DateTextBox();
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	//构造Timestamp日期类型组件。
	_createTimestampWidget:function(){
		var widget = new unieap.form.DateTextBox(
				{
					displayFormatter:{dataFormat:"yyyy/MM/dd hh:mm:ss"},
					popup:{showsTime:24}
				}
				);
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	_getFormModeOption:function(dateType){
		var option = "M";
		switch(dateType){
		case unieap.DATATYPES.BIGINT :
			option="E";
			break;
		case unieap.DATATYPES.BOOLEAN :
			option="E";
			break;
		case unieap.DATATYPES.DATE :
			option="E";
			break;
		case unieap.DATATYPES.DECIMAL :
			option="E";
			break;
		case unieap.DATATYPES.DOUBLE :
			option="E";
			break;
		case unieap.DATATYPES.FLOAT :
			option="E";
			break;
		case unieap.DATATYPES.INTEGER :
			option="E";
			break;
		case unieap.DATATYPES.LONGVARCHAR :
			option="M";
			break;
		case unieap.DATATYPES.NUMERIC :
			option="E";
			break;
		case unieap.DATATYPES.REAL :
			option="E";
			break;
		case unieap.DATATYPES.SMALLINT :
			option="E";
			break;			
		case unieap.DATATYPES.STRING :
			option="M";
			break;
		case unieap.DATATYPES.TIME :
			option="E";
			break;		
		case unieap.DATATYPES.TIMESTAMP :
			option="E";
			break;
		case unieap.DATATYPES.TINYINT :
			option="E";
			break;
		case unieap.DATATYPES.VARCHAR :
			option="M";
			break;
		default :
			option="M";
		}
	   return option;
	}
});
if(!dojo._hasResource["unieapx.query.AdvancedQuery"]){ 
dojo._hasResource["unieapx.query.AdvancedQuery"] = true;
dojo.provide("unieapx.query.AdvancedQuery");
dojo.require("unieap.util.util");
dojo.require("unieap.form.Button");
dojo.require("unieap.dialog.MessageBox");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("unieap.form.DateTextBox");
dojo.require("unieap.form.ComboBox");
dojo.require("unieap.form.CheckBox");
dojo.require("unieap.form.NumberTextBox");
dojo.require("unieap.ds");
dojo.declare(
	"unieapx.query.AdvancedQuery",
	[dijit._Widget, dijit._Templated],
{
	templateString:		
			"<div style=\"margin-left: 8px;\">"+
			"<table style=\"table-layout:fixed;\" dojoAttachPoint=\"tableNode\" cellSpacing=\"0\">"+
				"<colgroup>" +
				"	<col></col>" +
				"	<col width='30px'></col>" +
				"</colgroup>" +
					"<tbody dojoAttachPoint=\"tbodyNode\">" +
					"<tr height='25px'>" +
					"	<td valign='top'  dojoAttachPoint=\"paneConditionNode\" style=\"position:relative\">" +
					"	</td>" +
					"	<td dojoAttachPoint=\"addBtnNode\">" +
					"	</td>" +
					"</tr>" +
					"<tr>" +
					"	<td valign='top' dojoAttachPoint=\"paneConditionGridNode\"></td>" +
					"	<td valign='top' dojoAttachPoint=\"paneToolBarNode\"></td>" +
					"</tr>" +
					"<tr>" +
					"	<td colSpan='1' valign='top' dojoAttachPoint=\"paneQueryNode\"></td>" +
					"</tr>" +
					"</tbody>" +
			"</table>" +
			"</div>",
			
	
	/**
	 * @summary: 查询条件设置。
	 * @type: {Object}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           config="{'name':{store:'codeListStore',displayAttr:'NAME',valueAttr:'VALUE',dataType:'string'}}"> |</div>
	 *           上述代码表示: 对查询条件进行详细配置
	 * @default: null
	 */
	config:null,
	
	
	/**
	 * @summary: 查询结果集绑定目标对象ID值。
	 * @type: {string}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           target="queryResultGridId"> |</div> 上述代码表示:
	 *           点击查询按钮时，会将查询结果集绑定到id为queryResultGridId的组件上。
	 * @default: ""
	 */	
	target:"",
	
	label:"",
	
	/**
	 * @summary: 是否显示“查询”按钮。
	 * @description: 如果为true表示显示，false表示不显示，默认值为true。
	 * @type: {boolean}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           showQueryWigdet="false"> |</div> 上述代码表示: 页面不会显示“查询”按钮。
	 * @default: true
	 */
	showQueryToolBar:true,
	
	
	/**
	 * @summary: 查询结果集绑定目标组件每页记录数，默认值为0，表示读取系统分页常数值。 如果为-1，表示只有一页记录数。
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" pageSize="16"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */	
	pageSize:10,
	
	/**
	 * @summary: 查询组件宽度
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" width="80%"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */	
	width:"100%",
	
	/**
	 * @summary: 查询组件高度
	 * @type: {number}
	 * @example: |<div dojoType="unieap.query.AdvanceQuery" height="80%"> |</div>
	 *           上述代码表示: 目标组件每页记录数为16。
	 * @default: 10
	 */	
	height:"260px",
	
	/**
	 * @summary: 是否提供保存查询记录功能
	 * @type: {boolean}
	 */
	saveEnable:(typeof(unieap.widget.AdvancedQuery.saveEnable) == 'undefined')?true:unieap.widget.AdvancedQuery.saveEnable,
	
	//自动注入dataCenter
	Autowired : "dataCenter",
	
	entityClass:"",
	
	_queryGrid:null,
	
	_queryItem:null,
	
	_operator:null,
	
	_valueWidget:null,
	
	_historyConditions:[],
	
	_dataCenter:null,
	
	_queryStore:"_advancedQueryConditionStore",
	
	// 查询组件查询条件实体名称。
	_rowsetName : "com.neusoft.unieap.techcomp.ria.common.query.dto.Condition",
	
	// 整型条件类型提示信息。
	_integerMsg:RIA_UNIEAPX_I18N.query.integerPrompt,
	
	// 控件宽度
	_widgetWidth:"100%",
	
	// 查询条件Store
	_conditionStore:"object",
	
	// 存储查询条件及查询结果的DataCenter。
	_conditionDataCenter: new unieap.ds.DataCenter(),
	
	_queryResultStoreName:'_queryResultStore',
	
	_dataFormat:"yyyy-MM-dd",
	
	_operators:{'M':RIA_UNIEAPX_I18N.query.stringMatch,
		"LM":RIA_UNIEAPX_I18N.query.stringLeftMatch,
		"RM":RIA_UNIEAPX_I18N.query.stringRigthMatch,
		"NM":RIA_UNIEAPX_I18N.query.stringNotMatch,
		"NLM":RIA_UNIEAPX_I18N.query.stringLeftNotMatch,
		"NRM":RIA_UNIEAPX_I18N.query.stringRightNotMatch,
		"E":RIA_UNIEAPX_I18N.query.numberEquals,
		"NE":RIA_UNIEAPX_I18N.query.numberNotEquals,
		"G":RIA_UNIEAPX_I18N.query.numberGreaterThan,
		"S":RIA_UNIEAPX_I18N.query.numberLessThan,
		"GE":RIA_UNIEAPX_I18N.query.numberGreaterThanOrEquals,
		"SE":RIA_UNIEAPX_I18N.query.numberLessThanOrEquals
	},
	
	postCreate:function(){
		this._dataCenter = this.dataCenter || dataCenter;
		this._createContioner();
		this._createControls();
	},
	
	setEntityClass:function(entityClass){
		this.entityClass = entityClass;
	},
	
	setPageSize:function(pageSize){
		this.pageSize = pageSize;
	},
	getPageSize:function(){
		return this.pageSize;
	},
	setLabel:function(label){
		this.label = label;
	},
	getLabel:function(){
		return this.label;
	},
	setConfig:function(config){
		this.config = config;
		// 初始化数据:查询项
		var columnBoxStore = this._configQueryItemStore();
		var dataProvider = this._queryItem.getDataProvider();
		dataProvider.setDataStore(columnBoxStore);
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0 ){
			if(unieap.widget.form.comboShowSelect){
				this._queryItem.setValue(items[1].CODEVALUE);
			}else{
				this._queryItem.setValue(items[0].CODEVALUE);
			}
		}
	},
	getConfig:function(){
		return this.config;
	},
	getConditionStore:function(){
		return this._conditionDataCenter.getDataStore(this._queryStore);
	},
	setConditionStore:function(ds){
		if(ds == null || ds.getRowSet() == null){
			return;
		}
		var conditonDS = new unieap.ds.DataStore();
		conditonDS.setRowSetName(ds.getRowSetName());
		for(var i = 0 ; i < ds.getRowSet().getRowCount(); i++){
			var row = ds.getRowSet().getRow(i);
			// ---将具体数值转换为代码------------------
			var col = row.getItemValue('column');
			var op = row.getItemValue('operation');
			var valCode = row.getItemValue('value');
			var valText = valCode;
			var dataType = row.getItemValue('dataType');
			for(var key in this._operators){
				if(this._operators[key] === op){
					break;
				}
			}
			if(dataType === unieap.DATATYPES.DATE){
				valText = this._format(valCode);
			}
			//code转换
			if(this.config[col] != null){
				var storeName = this.config[col].store;
				var displayAttr = this.config[col].displayAttr;
				if(displayAttr == null || displayAttr === ""){
					displayAttr = 'CODENAME';
				}
				var valueAttr = this.config[col].valueAttr;
				if(valueAttr == null || displayAttr === ""){
					valueAttr = 'CODEVALUE';
				}
				if(storeName!= null){
					//-----------
					var codeName = valCode;
					var store = unieap.getDataStore(storeName,this._dataCenter,true);
					if(!store){
						store = unieap.Action.getCodeList(storeName);
					}
					if(store){
						var count = store.getRowSet().getRowCount();
						for(var h = 0 ; h < count; h++){
							var codeValue = store.getRowSet().getRow(h).getItemValue(valueAttr);
							if(codeValue === valCode){
								codeName = store.getRowSet().getRow(h).getItemValue(displayAttr);
								break;
							}
						}
					}
					//-----------
					valText = codeName;
				}
			}
			var rowData = this._getTransformToDisplay(col,op,valText,valCode);
			conditonDS.getRowSet().addRow(rowData);
		}
		this._conditionDataCenter.addDataStore(this._queryStore,conditonDS);
		this._queryGrid.getBinding().setDataStore(conditonDS);
	},
   	/**
	 * @summary: 执行查询后处理查询结果事件。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           onComplete="customOnComplete"> |</div> |function
	 *           customOnComplete(dc){ | //... |}
	 */
	onComplete:function(dc) {
		return;
	},
	
	/**
	 * @summary: 执行查询后渲染目标组件事件。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           onRenderTarget="customonRenderTarget"> |</div> |function
	 *           onRenderTarget(ds){ | //... |}
	 */
	onRenderTarget:function(resultStore){
   		// 将结果集绑定到目标组件上
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				widget.getBinding().setDataStore(resultStore);
   			}
		}
	},
	
	
  	/**
	 * @summary: 按条件进行数据查询。
	 * @example: |var queryObj=unieap.byId('queryId'); |queryObj.query();
	 */
	query:function(){
		// 重新查询查询时，将翻页记录置回第一页
		if (this.target) {
   			var widget = unieap.byId(this.target);
   			var resultStore = null;
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
   			if(resultStore){
   				resultStore.setPageNumber(1);
   			}
		}
		// 准备查询条件
		var store = this._queryGrid.getBinding().getDataStore();
		var conditionDS = this._transformCondition(store);
		// 执行查询
   		if(conditionDS){
   			this._conditionDataCenter.addDataStore(this._queryStore,conditionDS);
   			this._dataCenter.addDataStore("_advancedQueryConditionStore",conditionDS);
   			this.doQuery(conditionDS,this.onComplete);
   		}
	},
	
	/**
	 * @summary: 执行查询事件实现，可以通过覆盖此方法实现自定义查询。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           doQuery="customDoQuery"> |</div> |function
	 *           customDoQuery(queryStore,onComplete){ | //... |}
	 */
	doQuery:function(queryStore,onComplete){
		// 准备target绑定的DataStore
		var resultStore = null;
   		if (this.target) {
   			var widget = unieap.byId(this.target);
   			if(widget){
   				resultStore = widget.getBinding().getDataStore();
   			}
		}
   		if(!resultStore)
   			resultStore = new unieap.ds.DataStore(this._queryResultStoreName);
   		// 设置目标每页记录数
   		resultStore.setPageSize(this.pageSize);
		// 根据查询条件执行查询
   		var resultDataStore = this._queryResultDataStore(queryStore , resultStore);
	},
	
	/**
	 * @summary 根据查询条件与查询结果集返回查询结果数据。
	 */
   	_queryResultDataStore:function(queryStore , resultStore){
   		// 如果没有配置entityClass属性，则从store中取得实体class。
		var rowSetName = this.entityClass;
		if(rowSetName === ""){
			rowSetName = resultStore.getRowSetName();
		}
   		var paramDC = new unieap.ds.DataCenter();
   		paramDC.addDataStore(queryStore);
   		paramDC.addDataStore(this._queryResultStoreName,resultStore);
   		var dc = new unieap.ds.DataCenter();
   		var _this = this;
   		if(this.target){
   			var widget = unieap.byId(this.target);
   			widget.getBinding().rpc = function(store,load){
   	   			var dc = new unieap.ds.DataCenter();
   	   			dc.addDataStore(store);
   	   			dc.addDataStore(this._dataCenter.getDataStore("_advancedQueryConditionStore"));
   	   			dc.addParameter("_entityClass",name);
   	   			var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQuery.action";
   	   			if(store){
   	   				var name = store.getRowSetName();
   	   			}
   	   			unieap.Action.requestData({
   	   				url:path,
   	   				sync:false,
   	   				load:function(dc){
   	   					load&&load(dc);
   	   				},
   	   				error:function(e){
   	   					throw new Error(e);
   	   				}
   	   			},dc);
   	   		};
   		}
   		this.doQueryRequestData(paramDC,rowSetName,this._queryResultStoreName,this._queryStore,dc,_this);
   	},
	/**
	 * @summary: 查询请求
	 */
	doQueryRequestData:function(paramDC,rowSetName,queryResultStoreName,queryStore,retDc,_this){
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQuery.action";
		var dc = unieap.Action.requestData({
			url:path,
			parameters:
				{
					"_entityClass":rowSetName
				},
			sync:false,
			load:function(dc){
				var ds = dc.getSingleDataStore();
				if(ds){
					var name = ds.getName();
					var timeStamp = dc.getParameter(name);
					unieap.setDataStore(ds,this._dataCenter,true,timeStamp);
					_this.onRenderTarget(ds);
			   		_this._conditionDataCenter.addDataStore(ds);
			   		// 执行回调方法
					_this.onComplete(_this._conditionDataCenter);
				}
			},
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
   	},
	
   	/**
	 * @summary: 设置目标组件ID值。
	 * @example: |var queryObj=unieap.byId('queryId');
	 *           |queryObj.setTarget("targetId");
	 */
   	setTarget:function(target) {
   		this.target = target;
   	},
   	/**
	 * @summary: 获取目标组件ID值。
	 * @example: |var queryObj=unieap.byId('queryId'); |queryObj.getTarget();
	 */
   	getTarget:function() {
   		return this.target;
   	},
   	
   	_createContioner:function(){
   		var contioner = new unieap.layout.AdaptiveContainer();
   		contioner.setHeight(this.height);
   	},
	_createControls:function(){
   		dojo.style(this.tableNode,"width",this.width);
		this._createQueryFormPane();
		this._createConditionGridPane();
		this._createToolBarPane();
		if(this.showQueryToolBar === true){
			this._createQueryBarPane();
		}
	},
	_createQueryFormPane:function(){
		// ----------创建设置查询项布局-----------------
		var conditionTable = 
			"<table height='100%' width=\"100%\" style=\"margin: 5px 0px;table-layout: fixed;\" cellSpacing=\"0\" >" +
				"<colgroup>" +
				"	<col width='8%'></col>" +
				"	<col width='22%'></col>" +
				"	<col width='8%'></col>" +
				"	<col width='22%'></col>" +
				"	<col width='8%'></col>" +
				"	<col width='22%'></col>" +
				"</colgroup>" +
				"<tbody>" +
				"<tr height='25px'>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>" +
						"<td></td>"+
					"</tr>" +
				"</tbody>"+
			"</table>";
		this.paneConditionNode.innerHTML = conditionTable;
		dojo.parser.parse(this.paneConditionNode);
		var table = this.paneConditionNode.firstChild;
		var row = table.rows[0];
		// 创建查询项输入域
		var cell = row.cells[0];
		var label = document.createElement("label");
		label.setAttribute("width",'100%');
		label.innerHTML = RIA_UNIEAPX_I18N.query.queryItem;
		cell.appendChild(label);
		cell = row.cells[1];
		var valueWidget = new unieap.form.ComboBox({required:true});
		this._queryItem = valueWidget;
		var popup = this._queryItem.getPopup();
		popup.height = 110;
		popup.displayStyle ="list";
		this._queryItem.setWidth("100%");
		// 初始化数据
		var columnBoxStore = this._configQueryItemStore();
		var dataProvider = this._queryItem.getDataProvider();
		dataProvider.setDataStore(columnBoxStore);
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			if(unieap.widget.form.comboShowSelect){
				this._queryItem.setValue(items[1].CODEVALUE);
			}else{
				this._queryItem.setValue(items[0].CODEVALUE);
			}
		}
		cell.appendChild(this._queryItem.domNode);
		var _this = this;
		dojo.connect(this._queryItem,"onChange",function(){_this._columnBoxOnChange(_this._queryItem)});
		// 创建操作输入域
		cell = row.cells[2];
		var label = document.createElement("label");
		label.setAttribute("width",'100%');
		label.innerHTML = RIA_UNIEAPX_I18N.query.operation;
		cell.appendChild(label);
		cell = row.cells[3];
		valueWidget = new unieap.form.ComboBox({required:true});
		
		// 初始化数据
		var dataProvider = valueWidget.getDataProvider();
		dataProvider.setDataStore(this._construtStringDataStore());
		valueWidget.setWidth("100%");
		this._operationWidget = valueWidget;
		this._operationWidget.getPopup().height = 110;
		this._operationWidget.getPopup().displayStyle ="list";
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			if(unieap.widget.form.comboShowSelect){
				this._operationWidget.setValue(items[1].CODEVALUE);
			}else{
				this._operationWidget.setValue(items[0].CODEVALUE);
			}
		}
		cell.appendChild(this._operationWidget.domNode);
		// 创建值输入域
		cell = row.cells[4];
		var label = document.createElement("label");
		label.setAttribute("width",'100%');
		label.innerHTML = RIA_UNIEAPX_I18N.query.value;
		cell.appendChild(label);
		cell = row.cells[5];
		valueWidget = new unieap.form.TextBox({required:true});
		valueWidget.setWidth("100%");
		this._valueWidget = valueWidget;
		cell.appendChild(valueWidget.domNode);
		//支持持久化条件
//		var width = this.paneConditionNode.getAttribute("clientWidth");
//		if(width == null || width < 18){
//			dojo.style(table,'width','95%');
//		}else{
//			dojo.style(table,'width',(width - 18));
//		}
		if(this.saveEnable == true){
			dojo.style(table,'width','95%');
			if(!this.menuNode){
				this.menuNode=dojo.create('div','',this.paneConditionNode,'first');
				dojo.addClass(this.menuNode,'queryMenuTop');
				dojo.connect(this.menuNode,'onclick',this,'menuward');
			}
			dojo.style(this.menuNode,'display','block');
		}
	},
	
	menuward:function(e){
		dojo.require("unieap.menu.Menu");
		if(this.menu == null || this.menu == undefined){
			this._doQueryHistoryCondition();
			if(this.menu != null && this.menu != undefined){
				this.menu.startup();
				this.menu._openMyself(e);
			}
		}else{
			if((this.menuItems && this.menuItems.length ==0)||this.menu == undefined){
					MessageBox.alert({
//						message : "无历史查询条件。" // MODIFY BY TENGYF
		   				message : RIA_UNIEAPX_I18N.query.noHistoryCondition
		   			});
			}else{
				this.updateMenu(this.menuItems);
				this.menu.startup();
				this.menu._openMyself(e);
			}
		}
	},
	
	_doQueryHistoryCondition:function(){
		var viewcontext = unieap.Action.getViewContext(this);
		if(viewcontext && viewcontext != null){
			var viewId = viewcontext.context;
		}else{
			var viewId = "";
		}
		var controlId = this._getId();
		var _this = this; 
   		var paramDC = new unieap.ds.DataCenter();
   		var dc = new unieap.ds.DataCenter();
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doQueryHistoryConditions.action";
   		paramDC.addParameter("_viewId",viewId);
   		paramDC.addParameter("_controlId",controlId);
   		paramDC.addParameter("_queryLabel",_this.getLabel());
		var dc = unieap.Action.requestData({
			url:path,
			sync:true,
			load:function(dc){
  				var ds = dc.getSingleDataStore();
  				if(ds != null && ds.getRowSet() != null){
  					_this.menuItems = ds.getRowSet().getData(unieap.ds.Buffer.PRIMARY);
  					if(_this.menuItems && _this.menuItems.length ==0){
  						MessageBox.alert({
//  			   			message : "无历史查询条件。"
  			   				message : RIA_UNIEAPX_I18N.query.noHistoryCondition
  			   			});
  					}else{
  						_this.updateMenu(_this.menuItems);
  					}
  				}
	
			},
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
	},
	
	_getId:function(){
		var controlId = this._rootID == null ? this.id : this.id.substr((this.id.lastIndexOf(this._rootID)==-1?0:this.id.lastIndexOf(this._rootID))+this._rootID.length,this.id.length);
		return controlId;
	},
	
	updateMenu:function(menuItems){
		if(!this.menu){
			this.menu=new unieap.menu.Menu({});
		}
		this.menu.destroy();
		this.menu=new unieap.menu.Menu({});
		
		var _this = this;
		var getFun = function (child){
			return function(){
				//加入条件
				var cs = child['condition'];
				if(cs != ""){
					var json = dojo.fromJson(cs);
					var ds = new unieap.ds.DataStore();
					var rowset = new unieap.ds.RowSet(json);
					ds.setRowSet(rowset);
					ds.setRowSetName(_this._rowsetName);
					_this.setConditionStore(ds);
				}
			}	
		}
		if(menuItems == undefined || menuItems == null){
			return;
		}
		var item,childMenu;
		if(menuItems.length < 6){
			for(var l=menuItems.length,i=0;i<l;i++){
				var child=menuItems[i];
				var name = child['name'];
				var f=getFun(child);
				var menuItem = new unieap.menu.MenuItem({
					label:name,
					onClick:f
				});
				var deleteNode=dojo.create('div',{'class':'query-delete'},menuItem.arrowCell.firstChild,'first');
				dojo.style(menuItem.arrowCell.firstChild,"display","inline");
				deleteNode.deleteNodeIndex = i;
				dojo.connect(deleteNode,'onclick',this,"_deleteMenu");
				this.menu.addChild(menuItem);
			}
		}else{
			for(var l=menuItems.length,i=0;i<l;i++){
				if((i)%5==0){
					var itemLabel="Items "+(i+1)+"--"+(i+5);
					if(i+5>=l){
						itemLabel="Items "+(i+1)+"--"+(l)
					}
					childMenu=new unieap.menu.Menu();
					item=new  unieap.menu.PopupMenuItem({
						popup:childMenu,
						label:itemLabel,
						popupDelay:50
					});
					this.menu.addChild(item);
				}
				var child=menuItems[i];
				var t=child['name'];
				var f=getFun(child);
				var menuItem = new unieap.menu.MenuItem({
					label:t,
					onClick:f
				});
				childMenu.addChild(menuItem);
				var deleteNode=dojo.create('div',{'class':'query-delete'},menuItem.arrowCell.firstChild,'first');
				dojo.style(menuItem.arrowCell.firstChild,"display","inline");
				deleteNode.deleteNodeIndex = i;
				dojo.connect(deleteNode,'onclick',this,"_deleteMenu");
			}
		}
	},
	
	_deleteMenu:function(e){
		var node = e.srcElement || e.target;
		var index = node.deleteNodeIndex;
		dojo.stopEvent(e);
		var _this = this;
		MessageBox.confirm({
//			message:"是否确认删除？",
			message:RIA_UNIEAPX_I18N.query.confirmDelete,
			onComplete: function(value){
			   	if(value){
			   		if(index != undefined ){
			   			_this._deleteHistoryCondition(index);
			   		}
			   	}
			},
			iconCloseComplete:true
		});
	},
	
	_deleteHistoryCondition :function(index){
		var hcon = this.menuItems[index];
		if(hcon){
			var advancedConditionId = hcon['id'];
			var paramDC = new unieap.ds.DataCenter();
			var dc = new unieap.ds.DataCenter();
			var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doDelete.action";
			paramDC.addParameter("_advancedConditionId",advancedConditionId);
			var _this = this;
			var dc = unieap.Action.requestData({
				url:path,
				sync:true,
				load:function(dc){
				_this._deleteHistoryConditionLoad(index);
			},
			error:function(e){
				throw new Error(e);
			}
			},paramDC);
		}
		
	},
	
	_deleteHistoryConditionLoad:function(index){
		if(this.menuItems.length <6){
			this.menu.getChildren()[index].destroy();
		}else{
			var popIndex = Math.floor(index/5);
			var popItem = this.menu.getChildren()[popIndex];
			var children = popItem.popup.getChildren();
			var menuIndex = index%5;
			var menu = children[menuIndex];
			if(menu){
				menu.destroy();
			}
		}
		this.menuItems.splice(index,1);
	},
	
	
	
	_createConditionGridPane:function(){
		// 是否显示行号
		var vm = {rowNumber: false,onRowClick:dojo.hitch(this,this._selectRow)};
		// 锁定列数据
		var fixedColumns=[];
		// 非锁定列数据
		var columns=[
	 		{label: RIA_UNIEAPX_I18N.query.queryItem,name: "column",width: "30%"},
			{label: RIA_UNIEAPX_I18N.query.operation,name: "operator",width: "30%"},
			{label: RIA_UNIEAPX_I18N.query.value,name : "value",width : "30%"}
		]
		var fixed={noscroll: true,rows:[fixedColumns]};
		var header={rows:[columns]}
		var layout = [fixed, header];
		var gridHeight = String(this.height);
		gridHeight = (gridHeight.indexOf("%") < 0 ? parseInt(gridHeight, 10) : gridHeight) - 75; //上下边框占位3象素
		// 数据绑定
		var binding = {store:'advancedQueryStore'};
		//单选
		var selection={selectType:'single'};
		var decoder = {};
		this._queryGrid = new unieap.xgrid.Grid({   
			views: vm,
			layout: {structure:layout},
			selection:selection,
			width: "100%",
			height: gridHeight
		});
		// 设置grid绑定的数据集
		var conditionStore = new unieap.ds.DataStore();
		conditionStore.setRowSetName(this._rowsetName);
		this._queryGrid.getBinding().setDataStore(conditionStore);
		this._conditionStore = new unieap.ds.DataStore();
		// 设置grid的选择类型
//		this._queryGrid.getManager("SelectionManager").setSelectType("single");
		// 绑定grid选择事件
		var _this = this;
		dojo.connect(this._queryGrid.getManager("SelectionManager"),"onAfterSelect",this,function(){_this._onAfterSelectGridRow(this._queryItem)});
		this.paneConditionGridNode.appendChild(this._queryGrid.domNode);
	},
	
	_selectRow:function(evt){
		this._queryGrid.getManager("SelectionManager").setSelect(evt.rowIndex,true);
	},
	_createQueryBarPane:function(){
		// ----------创建QueryBar布局-----------------
		var toolbarTable = 
			"<table width='100%'  style=\"margin: 5px 0px;table-layout:fixed;\" cellSpacing=\"0\" >" +
				"<colgroup>" +
				"	<col></col>" +
				"	<col></col>" +
				"	<col width=\"145px\"></col>" +
				"	<col width=\"145px\"></col>" +
				"</colgroup>" +
				"<tbody>" +
				"<tr height='30px'>" +
				"	<td></td>" +
				"	<td></td>" +
				"	<td align=\"right\"></td>" +
				"	<td align=\"right\"></td>" +
				"</tr>" +
				"</tbody>" +
			"</table>";
		this.paneQueryNode.innerHTML = toolbarTable;
		dojo.parser.parse(this.paneQueryNode);
		// ----------动态创建toolBar-----------------
		var table = this.paneQueryNode.firstChild;
		var rowBar = table.rows[0];
		// 创建查询按钮
		var queryCell = rowBar.cells[2];
		var queryButton = new unieap.form.Button({
			"class":"btn-success",
			"width":"140px"
		});
		queryButton.setLabel(RIA_UNIEAPX_I18N.query.queryLabel);
		queryCell.appendChild(queryButton.domNode);
		dojo.connect(queryButton,"onClick",this,this.query)
		// 创建关闭按钮
		var closeCell = rowBar.cells[3];
		var closeButton = new unieap.form.Button({
			"class":"btn-default",
			"width":"140px"
		});
		closeButton.setLabel(RIA_UNIEAPX_I18N.query.closeLabel);
		closeCell.appendChild(closeButton.domNode);
		dojo.connect(closeButton,"onClick",this,this._doClose)
	},
	_doClose:function(){
		var dialog = unieap.getDialog()== null? unieap.getXDialog():unieap.getDialog();
		if(dialog !=null){
			dialog.close(false);
		}
	},
	_createToolBarPane:function(){
		// ----------创建toolBar布局-----------------
		var toolbarTable = "<table width='100%' style=\"table-layout:fixed;\">" +
		"<colgroup><col width='100%'></col></colgroup>" +
		"<tbody>" +
		"	<tr height='0px'><td align='center' valign='top'></td></tr >" +
		"	<tr height='30px'><td align='center' valign='top'></td>	</tr>" +
		"	<tr height='30px'><td align='center' valign='top'></td>	</tr>" +
		"	<tr height='30px'><td align='center' valign='top'></td>	</tr>" +
		"	<tr height='30px'><td align='center' valign='top'></td></tr>" +
		"</tbody>" +
		"</table>";
//		this.paneToolBarNode.innerHTML = toolbarTable;
		dojo.parser.parse(this.paneToolBarNode);
		// ----------动态创建toolBar-----------------
//		var table = this.paneToolBarNode.firstChild;
		// 创建新增按钮
//		var addRow = table.rows[1];
//		var addCell = addRow.cells[0];
		var addButton = new unieap.form.Button({
			"class":"titlePane-button-add"
		});
		addButton.setLabel(RIA_UNIEAPX_I18N.query.addLabel);
//		addButton.setWidth("70px");
//		addButton.setIconClass('query-add');
		var className = addButton.domNode.className;
		this.addBtnNode.appendChild(addButton.domNode);
		dojo.connect(addButton,"onClick",this,this._addNewRowOnClick);
		// 创建修改按钮
//		var modifyRow = table.rows[2];
//		var modifyCell = modifyRow.cells[0];
//		var modifyButton = new unieap.form.Button();
//		modifyButton.setLabel(RIA_UNIEAPX_I18N.query.modifyLabel);
//		modifyButton.setWidth("70px");
//		modifyButton.setIconClass("query-editor");
//		modifyCell.appendChild(modifyButton.domNode);
//		dojo.connect(modifyButton,"onClick",this,this._modifyRowOnClick);
		// 创建删除按钮
		var deleteButton = new unieap.form.Button({
			"class":"titlePane-button-delete"
		});
		deleteButton.setLabel(RIA_UNIEAPX_I18N.query.deleteLabel);
		this.paneToolBarNode.appendChild(deleteButton.domNode);
		dojo.connect(deleteButton,"onClick",this,this._deleteNewRowOnClick);
		// 创建保存按钮
		var saveRowsButton = new unieap.form.Button({
			"class":"titlePane-button-save"
		});
		saveRowsButton.setLabel(RIA_UNIEAPX_I18N.query.save);
		this.paneToolBarNode.appendChild(saveRowsButton.domNode);
		dojo.connect(saveRowsButton,"onClick",this,this._saveRowsOnClick);
		if(this.saveEnable == false){
			dojo.style(saveRowsButton.domNode,"display","none");
		}
	},
	
	_saveRowsOnClick :function(){
		var _this = this;
		var store = _this._queryGrid.getBinding().getDataStore();
		if(store && store.getRowSet() && store.getRowSet().getRowCount()==0){
			MessageBox.alert({
//   			message : "请新增查询条件！"
				message : RIA_UNIEAPX_I18N.query.addSelectConditon
   			});
		}else{
			MessageBox.prompt({
//				title:"输入框",
				title:RIA_UNIEAPX_I18N.query.input,
//				message :"查询条件名称：",
				message :RIA_UNIEAPX_I18N.query.coditionName,
				onComplete: function(value){
				if(value.btn){
					var conditionDS = _this._transformCondition(store);
					if(conditionDS){
						_this.doSave(conditionDS,value.text);
					}
					
				}
			}
			});
		}
	},
	
	/**
	 * @summary: 执行查询事件实现，可以通过覆盖此方法实现自定义查询。
	 * @example: |<div dojoType="unieap.query.AdvanceQuery"
	 *           doQuery="customDoQuery"> |</div> |function
	 *           customDoQuery(queryStore,onComplete){ | //... |}
	 */
	doSave:function(queryStore,text){
		var viewcontext = unieap.Action.getViewContext(this);
		if(viewcontext && viewcontext != null){
			var viewId = viewcontext.context;
		}else{
			var viewId = "undefined";
		}
		var _this = this;
		var name = text;
		if(name === ""){
//			name = "条件";
			name = RIA_UNIEAPX_I18N.query.condition;
		}
		var label = this.getLabel();
		if(label == undefined || label == null || label == ""){
//			var dialog = unieap.getDialog() == null ? unieap.getXDialog():null;
//			if(dialog == null){
//				this.setLabel("");
//			}else{
//				this.setLabel(dialog.getLabel());
//			}
			label = "";
		}
   		var paramDC = new unieap.ds.DataCenter();
   		paramDC.addDataStore(queryStore);
   		var dc = new unieap.ds.DataCenter();
   		paramDC.addParameter("_viewId",viewId);
   		paramDC.addParameter("_conditionName",name);
   		paramDC.addParameter("_controlId",_this._getId());
   		paramDC.addParameter("_queryLabel",_this.getLabel());
   		var path =unieap.WEB_APP_NAME + "/techcomp/ria/queryAction!doSave.action";
		var dc = unieap.Action.requestData({
			url:path,
			sync:false,
			load:function(dc){
  				//菜单增加一项
  				MessageBox.alert({
//	   				message : "保存成功"
  					message : RIA_UNIEAPX_I18N.query.saveSuccess
	   			});
  				var ds = dc.getSingleDataStore();
  				if(ds!=null && ds.getRowSet()!=null && ds.getRowSet().getRowCount() >0){
  					var data = ds.getRowSet().getData(unieap.ds.Buffer.PRIMARY);
  					if(_this.menuItems == undefined || _this.menuItems == null){
  						_this.menuItems = [];
  					}
  					_this.menuItems.push(data[0]);
  				}
			},
			error:function(e){
				throw new Error(e);
			}
		},paramDC);
	},
	
//	_addMenu:function(data){
//		var getFun = function (child){
//			return function(){
//				//加入条件
//				var cs = child['conditionString'];
//				if(cs != ""){
//					var json = dojo.fromJson(cs);
//					var ds = new unieap.ds.DataStore();
//					var rowset = new unieap.ds.RowSet(json);
//					ds.setRowSet(rowset);
//					ds.setRowSetName(_this._rowsetName);
//					_this.setConditionStore(ds);
//				}
//			}	
//		}
//		var l = this.menuItems.length;
//		if(l < 5){
//			var name = data['name'];
//			var f = getFun(data);
//			this.menu.addChild(new unieap.menu.MenuItem({
//				label:name,
//				onClick:f
//			}));
//		}else{
//			var f=getFun(data);
//			var name = data['name'];
//			if(l%5 == 0){
//				var i = l/5;
//				var itemLabel="Items "+(i*5+1)+"--"+(i*5+5);
//				childMenu=new unieap.menu.Menu();
//				item=new  unieap.menu.PopupMenuItem({
//					popup:childMenu,
//					label:itemLabel
//				});
//				this.menu.addChild(item);
//				childMenu.addChild(new unieap.menu.MenuItem({
//					label:t,
//					onClick:f
//				}));
//			}else{
//				var popMenus = menu.getChildren();
//				var childMenu = popMenus[popMenus.length-1];
//				childMenu.addChild(new unieap.menu.MenuItem({
//					label:t,
//					onClick:f
//				}));
//			}
//		}
//	},
	
	clear:function(){
		// 初始化数据:查询项
		var columnBoxStore = this._configQueryItemStore();
		var dataProvider = this._queryItem.getDataProvider();
		dataProvider.setDataStore(columnBoxStore);
		// 选中下拉框第一项
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			this._queryItem.setValue(items[0].CODEVALUE);
		}
		this._valueWidget.setValue("");
		this._queryGrid.getBinding().getDataStore().getRowSet().deleteAllRows();
	},
 
	/**
	 * @summary: 准备查询条件
	 */
	_transformCondition:function(store){
		var conditonDS = new unieap.ds.DataStore();
		conditonDS.setName("_advancedQueryConditionStore");
		conditonDS.setRowSetName(store.getRowSetName());
		if(store){
			for(var i = 0 ; i < store.getRowSet().getRowCount(); i++){
				var row = store.getRowSet().getRow(i);
				// ---将具体数值转换为代码------------------
				var col = row.getItemValue('column');
				var op = row.getItemValue('operator');
				var val = row.getItemValue('value');
				var valCode = row.getItemValue('valueCode');
				var colValue = this._getItemValue(this._queryItem,col);
				for(var key in this._operators){
					if(this._operators[key] === op){
						break;
					}
				}
				// 初始化conditionStore
				rowData = {'column':colValue,'operation':key,'dataType':this._getQueryItemDataType(colValue),'value':valCode+"",'order':this._getQueryItemOrder(colValue)};
				conditonDS.getRowSet().addRow(rowData);
				// ----------------------------------------
			}
		}
		return conditonDS;
	},

   
	// 根据查询数据Store配置查询下拉列表数据。
	_configQueryItemStore:function(){
		var conditionStore = new unieap.ds.DataStore();
		var codename = null;
		var codevalue = null;
		if(this.config != null){
			for(var key in this.config){
				// 查询项配置信息
				itemConfigInfo = this.config[key];
				codeName = itemConfigInfo.label;
				codeValue = key;
				conditionStore.getRowSet().addRow({CODENAME:codeName,CODEVALUE:codeValue});
			}
		}
		return conditionStore;
   		
	},
	// 条件数据下拉列表变化时绑定方法。
	_columnBoxOnChange:function(box){
		this._setConditionAvailable(box);
	},
	// 将条件输入框设置为可用并设置可选的值。
	_setConditionAvailable:function(box){
		var value = this._queryItem.getValue();
		var config = this.config;
		// 获得查询项数据类型
		var dataType = this._getQueryItemDataType(value);
		// 获得查询操作设置
		var conditionDataStore = this._getConditionStoreByType(dataType);
		var conditionBox = this._getConditionWidget(box);
		conditionBox.setDisabled(false);
		var dataProvider = conditionBox.getDataProvider();
		dataProvider.setDataStore(conditionDataStore);
		var items = dataProvider.getItems();
		if(items != null && items.length > 0){
			conditionBox.setValue(items[0].CODEVALUE);
		};
		// 设置查询值控件显示
		this._displayValueWidget(box,dataType,config[value]);
	},
	_getQueryItemDataType:function(key){
		if(this.config != null){
			var itemConfigInfo = this.config[key];
			if(itemConfigInfo === undefined || itemConfigInfo === null){
				return null;
			}
			var dataType = itemConfigInfo.dataType;
			// 默认为String类型
			if(dataType === undefined || dataType === null){
				return 12;
			}
			return dataType;
		}
	},
	_getQueryItemOrder:function(key){
		if(this.config != null){
			var itemConfigInfo = this.config[key];
			if(itemConfigInfo === undefined || itemConfigInfo === null){
				return null;
			}
			var order = itemConfigInfo.order;
			// 默认为String类型
			if(order === undefined || order === null){
				return "";
			}
			return order;
		}
	},
	// 根据单元格对象获取条件编辑下拉列表组件。
	_getConditionWidget:function(box){
		var conditionNode = box.domNode.parentNode.parentNode.cells[3].childNodes[0];
		return dijit.byNode(conditionNode);
	},
	// 根据单元格对象获取条件编辑value组件。
	_getCurrentValueWidget:function(box){
		var conditionNode = box.domNode.parentNode.parentNode.cells[5].childNodes[0];
		return dijit.byNode(conditionNode);
	},
	// 使条件编辑下拉列表组件可用。
	_displayValueWidget:function(box,dataType,itemConfig){
		var widget = this._getValueWidgetByType(dataType,itemConfig);
		this._valueWidget = widget;
		var cell = box.domNode.parentNode.parentNode.cells[5];
		if(cell.childNodes[0]){
			cell.removeChild(cell.childNodes[0]);
		}
		cell.appendChild(widget.domNode);
	},	
	// 根据数据类型获取组件对象。
	_getValueWidgetByType:function(dateType,itemConfig){
		var widget = null;
		if(itemConfig){
			var store = itemConfig.store;
			// 下拉列表和下拉树
			if(store != null && store != ""){
				widget = this._createSelectedWidget(itemConfig);
			}else{
				switch(dateType){
				case unieap.DATATYPES.BIGINT :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;
				case unieap.DATATYPES.BOOLEAN :
					widget = this._createSelectedWidget(itemConfig);
					break;
				case unieap.DATATYPES.DATE :
					widget = this._createDateWidget();
					break;
				case unieap.DATATYPES.DECIMAL :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.DOUBLE :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.FLOAT :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.INTEGER :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;
				case unieap.DATATYPES.LONGVARCHAR :
					widget = this._createStringWidget();
					break;
				case unieap.DATATYPES.NUMERIC :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.REAL :
					widget = this._createNumberWidget();
					break;
				case unieap.DATATYPES.SMALLINT :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;			
				case unieap.DATATYPES.STRING :
					widget = this._createStringWidget();
					break;
				case unieap.DATATYPES.TIME :
					widget = this._createDateWidget();
					break;		
				case unieap.DATATYPES.TIMESTAMP :
					widget = this._createTimestampWidget();
					break;
				case unieap.DATATYPES.TINYINT :
					widget = this._createNumberWidget();
					widget.range={allowDecimal:false};
					widget.getValidator().setErrorMsg(this._integerMsg); 
					break;
				case unieap.DATATYPES.VARCHAR :
					widget = this._createStringWidget();
					break;
				default :
					widget = this._createStringWidget();
				}
			}
		}else{
			widget = this._createStringWidget();
		}
		return widget;
	},
	// 构造字符类型组件。
	_createStringWidget:function(){
		var widget = new unieap.form.TextBox({trim:true,required:true});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	// 构造数字类型组件。
	_createNumberWidget:function(){
		var widget = new unieap.form.NumberTextBox({required:true});
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	// 构造下拉列表类型组件。
	_createSelectedWidget:function(itemConfig){
		var dataProvider = {};
		var value = this._queryItem.getValue();
		var dataType = itemConfig.dataType;
		var store = "";
		var ds = new unieap.ds.DataStore('CODE_VAR_STATE',
				[{CODEVALUE: 'true',CODENAME: RIA_UNIEAPX_I18N.query.isTrue},
				 {CODEVALUE: 'false',CODENAME: RIA_UNIEAPX_I18N.query.isFalse}]);
		if(dataType === unieap.DATATYPES.BOOLEAN){
			store = "CODE_VAR_STATE";
			if(!unieap.getDataStore(store)){
				dataCenter.addDataStore(ds);
			}
		}else{
			store = itemConfig.store;
		}
		dataProvider.store = store;
		var decoder = {displayAttr:itemConfig.displayAttr||'CODENAME',valueAttr:itemConfig.valueAttr||'CODEVALUE'};
		var widget = new unieap.form.ComboBox({readOnly:false,dataProvider:dataProvider,decoder:decoder,required:true});
		widget.setWidth(this._widgetWidth);
		widget.getPopup().height = 110;
		widget.getPopup().displayStyle= "list";
//		widget.getDataProvider().setDataStore(ds);
		return widget;
	},
	
	// 构造下拉树类型组件。
	_createComboBoxTreeWidget:function(metadata){
		if(!metadata.config){
			return this._createStringWidget();
		}
		var widget = null;
		// 构造来自代码表中下拉树
		if(metadata.config.treeJson && !metadata.config.treeJson.loader){
			var storeName = metadata.config.treeJson.binding.store;
			var ds = unieap.Action.getCodeList(storeName);
			if(ds){
				this._dataCenter.addDataStore(ds);
			}
			widget = new unieap.form.ComboBoxTree({
				readOnly:metadata.config.readOnly?metadata.config.readOnly:true,
				required:metadata.config.required?metadata.config.required:false,
				dataProvider:metadata.config.dataProvider,
				treeJson:{
					binding:{
						store:storeName,
						id:'ID',
						code:'CODEVALUE',
						label:'CODENAME',
						leaf:'leaf',
						parent:'PARENTID',
						query:{name:'PARENTID',relation:'=',value:'-1'}
					}
				},
					popup:metadata.config.popup,
					expandTree:metadata.config.expandTree
				});
		}else{
			// 构造自定义下拉树
			widget = new unieap.form.ComboBoxTree({
				readOnly:metadata.config.readOnly?metadata.config.readOnly:true,
				required:metadata.config.required?metadata.config.required:false,
				dataProvider:metadata.config.dataProvider,
				treeJson:{
					loader:metadata.config.treeJson?metadata.config.treeJson.loader:metadata.config.treeJson,
					binding:metadata.config.treeJson?metadata.config.treeJson.binding:metadata.config.treeJson
				},
				popup:metadata.config.popup,
				expandTree:metadata.config.expandTree
			});
		}
		widget.setWidth(this._widgetWidth);
		return widget;
	},
	// 构造日期类型组件。
	_createDateWidget:function(){
		var widget = new unieap.form.DateTextBox({required:true});
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	// 构造Timestamp日期类型组件。
	_createTimestampWidget:function(){
		var widget = new unieap.form.DateTextBox(
				{
					displayFormatter:{dataFormat:this._dataFormat},
					popup:{showsTime:24}
				}
				);
		widget.setWidth(this._widgetWidth);
		return widget; 
	},
	// 根据数据类型获取条件编辑列表数据。
	_getConditionStoreByType:function(dateType){
		var store = null;
		switch(dateType){
			case unieap.DATATYPES.BIGINT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.BOOLEAN :
				store = this._construtBooleanDataStore();
				break;
			case unieap.DATATYPES.DATE :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.DECIMAL :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.DOUBLE :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.FLOAT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.INTEGER :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.LONGVARCHAR :
				store = this._construtStringDataStore();
				break;
			case unieap.DATATYPES.NUMERIC :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.REAL :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.SMALLINT :
				store = this._construtNumberDataStore();
				break;			
			case unieap.DATATYPES.STRING :
				store = this._construtStringDataStore();
				break;
			case unieap.DATATYPES.TIME :
				store = this._construtNumberDataStore();
				break;		
			case unieap.DATATYPES.TIMESTAMP :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.TINYINT :
				store = this._construtNumberDataStore();
				break;
			case unieap.DATATYPES.VARCHAR :
				store = this._construtStringDataStore();
				break;																	
			default :
				store = this._construtStringDataStore();
		}
		return store;
	},
	// 构造字符类型列对应条件DataStore。
	_construtStringDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		
		rowset.addRow({CODEVALUE:"M",CODENAME:RIA_UNIEAPX_I18N.query.stringMatch});
		rowset.addRow({CODEVALUE:"LM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftMatch});
		rowset.addRow({CODEVALUE:"RM",CODENAME:RIA_UNIEAPX_I18N.query.stringRigthMatch});
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NM",CODENAME:RIA_UNIEAPX_I18N.query.stringNotMatch});
		rowset.addRow({CODEVALUE:"NLM",CODENAME:RIA_UNIEAPX_I18N.query.stringLeftNotMatch});
		rowset.addRow({CODEVALUE:"NRM",CODENAME:RIA_UNIEAPX_I18N.query.stringRightNotMatch});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return stringDataStore;
	}, 	
	// 构造数字类型列对应条件DataStore。
	_construtNumberDataStore:function(){
		var stringDataStore = new unieap.ds.DataStore();
		var rowset = stringDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		rowset.addRow({CODEVALUE:"G",CODENAME:RIA_UNIEAPX_I18N.query.numberGreaterThan});
		rowset.addRow({CODEVALUE:"S",CODENAME:RIA_UNIEAPX_I18N.query.numberLessThan});
		rowset.addRow({CODEVALUE:"GE",CODENAME:RIA_UNIEAPX_I18N.query.numberGreaterThanOrEquals});
		rowset.addRow({CODEVALUE:"SE",CODENAME:RIA_UNIEAPX_I18N.query.numberLessThanOrEquals});
		return stringDataStore;
	},
	// 构造布尔类型列对应条件DataStore。
	_construtBooleanDataStore:function(){
		var booleanDataStore = new unieap.ds.DataStore();
		var rowset = booleanDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return booleanDataStore;
	},
	// 构造布尔类型列对应条件DataStore。
	_construtBooleanDataStore:function(){
		var booleanDataStore = new unieap.ds.DataStore();
		var rowset = booleanDataStore.getRowSet();
		rowset.addRow({CODEVALUE:"E",CODENAME:RIA_UNIEAPX_I18N.query.numberEquals});
		rowset.addRow({CODEVALUE:"NE",CODENAME:RIA_UNIEAPX_I18N.query.numberNotEquals});
		return booleanDataStore;
	},
	// 校验当前输入条件是否符合规则
	_validateCondition:function(val){
		var queryValid = this._queryItem.getValidator().validate();
		var operationValid = this._operationWidget.getValidator().validate();
		var valueValid = this._valueWidget.getValidator().validate();
		if(!queryValid || !operationValid || !valueValid){
//			dojo.require("unieap.dialog.MessageBox");
//   			MessageBox.alert({
//   				title : RIA_I18N.dialog.messageBox.promptDialog,
//   				type : 'warn',
//   				message : this._integerMsg
//   			});
			return false;
		}
	},
	
	_collectUpdateCondition:function(addOrModify){
		var valueWidget = this._getCurrentValueWidget(this._queryItem);
		this._valueWidget = valueWidget;
		var val = valueWidget.getValue();
		var valText = valueWidget.getText();
		var flag = this._validateCondition(val);
		if(flag === false){
			return null;
		}else{
			var conditionStore = this._queryGrid.getBinding().getDataStore();
			var col = this._queryItem.getValue();
			var colText = this._queryItem.getText();
			var op = this._operationWidget.getValue();
			var count = conditionStore.getRowSet().getRowCount();
			// 判断是否重复
			for(var i = 0 ; i < count; i++){
				var rowData = conditionStore.getRowSet().getRowData(i);
				if(rowData == null){
					continue;
				}
				if(rowData["value"] != valText){
					continue;
				}
				if(rowData["column"] != colText){
					continue;
				}
				if(rowData["operator"] != this._operators[op]){
					continue;
				}
				break;
			}
			if(i === count){
				var rowData = this._getTransformToDisplay(col,op,valText,val);
				return rowData;
			}else{
				if(addOrModify == false){
//					var mes = "不能添加重复条件，请修改查询项的值。";
					var mes = RIA_UNIEAPX_I18N.query.cantAddRepeatConditionDoUpdate;
				}else{
					var mes = RIA_UNIEAPX_I18N.query.notDuplicateConditon;
				}
				dojo.require("unieap.dialog.MessageBox");
	   			MessageBox.alert({
	   				type : 'warn',
	   				message : mes
	   			});
			}
			return null;
		}
	},
	
	_getTransformToDisplay:function(col,op,valText,val){
		var colValue = this._getItemName(this._queryItem,col);
		var opValue = this._operators[op];
		var rowData = {column:colValue,operator:opValue,value:valText,valueCode:val};
		return rowData;
	},
	
	// 增加按钮点击事件绑定方法。
	_addNewRowOnClick:function(){
		var rowData = this._collectUpdateCondition(true);
		if(rowData != null){
			this._queryGrid.getBinding().getDataStore().getRowSet().addRow(rowData);
		}
	},
	_getItemName:function(widget,col){
		var store = widget.getDataProvider().getDataStore();
		if(store){
			var count = store.getRowSet().getRowCount();
			for(var i = 0 ; i < count; i++){
				var codeValue = store.getRowSet().getRow(i).getItemValue('CODEVALUE');
				if(codeValue === col){
					var codeName = store.getRowSet().getRow(i).getItemValue('CODENAME');
					return codeName;
				}
			}
		}
		return "";
	},
	_getItemValue:function(widget,col){
		var store = widget.getDataProvider().getDataStore();
		if(store){
			var count = store.getRowSet().getRowCount();
			for(var i = 0 ; i < count; i++){
				var codeName = store.getRowSet().getRow(i).getItemValue('CODENAME');
				if(codeName === col){
					var codeValue = store.getRowSet().getRow(i).getItemValue('CODEVALUE');
					return codeValue;
				}
			}
		}
		return "";
	},
	_modifyRowOnClick:function(){
		var rowIndexs = this._queryGrid.getManager("SelectionManager").getSelectedRowIndexs();
		if(rowIndexs != null && rowIndexs.length > 0){
			var rowData = this._collectUpdateCondition(false);
			if(rowData != null){
				var rowSet = this._queryGrid.getBinding().getDataStore().getRowSet();
				var row =  rowSet.getRow(rowIndexs[0]);
				for(var key in rowData){
					row.setItemValue(key,rowData[key]);
				}
				rowSet.resetUpdate();
			}
		}else{
   			MessageBox.alert({
   				type : 'warn',
//   			message : "请选择一条。"
   				message : RIA_UNIEAPX_I18N.query.selectOndeData
   			});
		}
	},
	_deleteNewRowOnClick:function(){
		var rowIndexs = this._queryGrid.getManager("SelectionManager").getSelectedRowIndexs();
		if(rowIndexs != null && rowIndexs.length > 0){
			this._queryGrid.getBinding().getDataStore().getRowSet().deleteRow(rowIndexs[0]);
		}else{
   			MessageBox.alert({
   				type : 'warn',
   				message : RIA_UNIEAPX_I18N.query.chooseQueryCondition
   			});
		}
	},
	_deleteAllRowOnClick:function(){
		this._queryGrid.getBinding().getDataStore().getRowSet().deleteAllRows();
	},
	_onAfterSelectGridRow:function(box){
		var rows = this._queryGrid.getManager("SelectionManager").getSelectedRows();
		if(rows != null && rows.length > 0){
			var col = rows[0].getItemValue('column');
			var op = rows[0].getItemValue('operator');
			var val = rows[0].getItemValue('value');
			var valCode = rows[0].getItemValue('valueCode');
			var colValue = this._getItemValue(this._queryItem,col);
			this._queryItem.setValue(colValue);
			this._setConditionAvailable(box);
			for(var key in this._operators){
				if(this._operators[key] === op){
					break;
				}
			}
			this._operationWidget.setValue(key);
			var conditionValue = valCode;
			this._valueWidget.setValue(conditionValue);
		}
	},
	_format: function(value){
		if(!value){
			return value;
		}
        var date = new Date(Number(value));
        return unieap.dateFormat(date.getTime(),this._dataFormat);
    }
});}
dojo.provide("unieapx.form.FormList");
dojo.require("unieap.util.util");
dojo.require("unieap.form.Form");
dojo.declare("unieapx.form.FormList",[dijit._Widget,dijit._Templated],{

	/**
	 * @declaredClass:
	 * 		unieap.form.FormList  
	 * @summary:
	 * 		类似于Form控件,但是会根据其绑定的DataStore同时显示多个Form
	 * @example:
	 * |<div dojoType="unieap.form.FormList" binding="{store:'emp'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_empno'}"></div>
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_ename'}"></div>
	 * |</div>
	 *
	 */

	/**
	 * @summary:
	 * 		设置控件绑定的dataStore
	 * @type:
	 * 		{unieap.form.FormListBinding}
	 * @example:
	 * |<div dojoType="unieap.form.FormList" binding="{store:'emp'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_empno'}"></div>
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_ename'}"></div>
	 * |</div>
	 */
	binding:null,


	 /**
	  * @summary:
	  * 	设置FormList控件的宽度
	  * @description:
	  * 	FormList的宽度默认为浏览器的宽度
	  * @type:
	  * 	{string}
	  * @default:
	  * 	"auto"
	  */
	 width:'auto',

	 /**
	  * @summary:
	  * 	是否插入一空行
	  * @description:
	  * 	当formList绑定的数据集为空时是否加入一空行
	  * @type:
	  * 	{boolean}
	  * @default:
	  * 	"false"
	  */
	 insertBlankRow: false,

	 /**
	  * @summary:
	  * 	设置FormList控件的高度
	  * @description:
	  * 	FormList的高度随着其嵌套的控件的高度而增加
	  * @type:
	  * 	{string}
	  * @default:
	  * 	"auto"
	  */
	 height:'auto',
	 
	 count: 0,
	 
	 formListCount: 0,
	 
	 //自动注入dataCenter
	 Autowired : "dataCenter",
	
	 radioNameArray : [],
	 
	 tabIndexArray : [],
	/**
	 * @summary:
	 * 		是否增加提示信息“正在加载数据...”
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		 false
	 * @example:
	 * |<div dojoType="unieap.xgrid.Grid" showLoading="true">
	 * |	...
	 * |</div>
	 */
	showLoading:false,

	templateString: "<div >" +
						"<div class='content-loading'  style='display:none;position:relative' dojoAttachPoint='contentLoading'>" +
						"<div class='content-loading-text' dojoAttachPoint='contentText'></div>" +
						"</div>" +
						"<div dojoAttachPoint='containerNode' style='overflow:auto;' ></div>" +						
					 "</div>",	
	/**
	 * @summary:
	 * 		设置FormList控件的宽度
	 * @param:
	 * 		{string} width
	 * @example:
	 * |<script type="text/javascript">
	 * |	var formList=unieap.byId('formList');
	 * |	formList.setWidth("400px");
	 * |</script>
	 */
	setWidth:function(width){
		if(isNaN(width)){
			dojo.style(this.domNode,'width',parseInt(width,10)+"px");
		}else{
			dojo.style(this.domNode,'width',width);			
		}
	},

	/**
	 * @summary:
	 * 		设置FormList控件的高度
	 * @param:
	 * 		{string} height
	 * @example:
	 * |<script type="text/javascript">
	 * |	var formList=unieap.byId('formList');
	 * |	formList.setHeight("400px");
	 * |</script>
	 */
	setHeight:function(height){
		dojo.style(this.domNode,'height',parseInt(height,10)+"px");
	},

	/**
	 * @summary:
	 * 		获得节点所在的Form的索引
	 * @description:
	 * 		如果传入的节点不在Form中,返回-1
	 * @param:
	 * 		{domNode|dijit._Widget} node
	 * @return:
	 * 		{number}
	 * @example:
	 * |<div dojoType="unieap.form.FormList" binding="{store:'emp'}">
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_empno'}"></div>
	 * |	<div dojoType="unieap.form.TextBox" binding="{name:'attr_ename'}"></div>
	 * |	<span onclick="getIndex(this)">获得绑定的索引号</span>
	 * |</div>
	 * |<script type="text/javascript">
	 * |	function getIndex(node){
	 * |		alert(unieap.byId('formList').getIndex(node));
	 * |	}
	 * |</script>
	 */
	getIndex:function(node){
		if(!node) return -1;
		var widget,parentWidget, _node;
		
		node instanceof dijit._Widget?(_node=node.domNode)&&(widget=node):
					(_node=node)&&(widget=dijit.byNode(_node));
		parentWidget = widget;
		while((parentWidget||0).declaredClass!='unieapx.form.FormList'&&_node.tagName!="BODY"){
			widget=dijit.byNode(_node);
			if(widget instanceof unieap.form.Form){
				return typeof(widget.rowIndex)=="undefined"?-1:widget.rowIndex;
			}else{
				_node=_node.parentNode;
				parentWidget = dijit.byNode(_node);
			}
		}
		return -1;
	},
	

	/**
	 * @summary:
	 * 		对FormList下的表单进行校验
	 * @param:
	 * 		{boolean} bool 是否自动弹出错误提示信息
	 * @return:
	 * 		{boolean}
	 */
	validate:function(bool){
		return !dojo.query(" > [widgetId]",this.containerNode).map(dijit.byNode).some(function(form){
			return form.validate(bool)==false;
		})
	},


    /**
     * @summary:
     * 		获得FormList的数据绑定模块
     * @return:
     * 		{unieap.form.FormListBinding}
     * @example:
     * |<script type="text/javascript">
     * |	var formList=unieap.byId('formList'),
     * |    	binding=formList.getBinding();
     * |</script>
     */
	getBinding: function() {
		return unieap.getModuleInstance(this,"binding","unieapx.form.FormListBinding");
	},


	/**
	 * @summary:
	 * 		获得FormList所有的Form控件
	 * @return :
	 * 		{array}
	 * @example:
	 * |<script type='text/javascript'>
	 * |	var forms=unieap.byId('formList').getForms();
	 * |	dojo.forEach(forms,function(form){
	 * |		alert(form.rowIndex);
	 * |	});
	 * |</script>
	 */
	getForms:function(){
		var arr=[];
		dojo.query(" > [widgetId]",this.containerNode).forEach(function(node){
			var widget=dijit.byNode(node);
			widget.declaredClass=='unieap.form.Form'&&arr.push(widget);
		});
		return arr;
	},

	/**
	 * @summary:
	 * 		通过索引号获得FormList指定的Form控件
	 * @return :
	 * 		{unieap.form.Form|null}
	 * @example:
	 * |<script type='text/javascript'>
	 * |	var form=unieap.byId('formList').getForm(0);
	 * |	unieap.debug(form);
	 * |</script>
	 */
	getForm:function(index){
		var forms=this.getForms();
		return forms[index]||null;
	},

	//不推荐使用
    _getFormChild:function(formIndex, childIndex){
    	var form = this.getForm(formIndex);
    	var arr=[];
    	dojo.query("[widgetId]", form.domNode).forEach(function(node){
    		var widget = dijit.byNode(node);
    		if(widget && widget.declaredClass != 'unieap.form.Form'){
    			arr.push(widget);
    		}
    	});
    	return arr[childIndex] || null;
    },

	postCreate:function(){
    	this.radioNameArray = [];
    	this.tabIndexArray = [];
    	this.count = 0;
		this.binding=this.getBinding();
		var self = this;
		//如果嵌套的Form控件有id或者jsId属性，删除id和jsId
		dojo.query("[dojoType]",this.containerNode).forEach(function(node){
			dojo.hasAttr(node,'id')&&dojo.removeAttr(node,'id');
			dojo.hasAttr(node,'jsId')&&dojo.removeAttr(node,'jsId');
			self.count++;
		});
		this.originNodeHTML=this.containerNode.innerHTML;
		if(this.width!="auto"){
			if(isNaN(this.width)){
				this.domNode.style.width = this.width;
			}else{
				this.domNode.style.width = parseInt(this.width,10)+"px";
			}
		}else{
			this.domNode.style.width = "100%";
		}
		
		if(this.showLoading){
			this.contentText.innerHTML = RIA_I18N.util.util.loading;
			dojo.style(this.contentLoading,'display','block');
		}
	},

	startup:function(){
		this._createForm();
	},
	
	_getDataStore:function(){
		return this.getBinding().store;
	},
	
	forceDestroy: function(){
		this.formListCount = -1;
	},
	
	_destroyFormWidget: function(){
		//清空ContainerNode下的节点
		dojo.query("[widgetId]",this.containerNode).map(dijit.byNode).forEach(function(widget){
			//防止销毁后执行FieldSet控件的startup方法
			widget._started=true;
			widget.destroy&&widget.destroy();
		});
		dojo.empty(this.containerNode);
	},

	//复制表单
	_createForm:function(){
		this._store=this._getDataStore();
		
		if(!this._store){
			if(this.insertBlankRow) {
				var rowSet = new unieap.ds.RowSet();
				rowSet.insertRow({}, 0);
				this._store = new unieap.ds.DataStore();
				this._store.setRowSet(rowSet);
			}else{
				this._destroyFormWidget();
				return;
			}
		}
		if(this._store.getRowSet().getRowCount()==0) {
			if(this.insertBlankRow){
				this._store.getRowSet().insertRow({}, 0);
			}else{
				this._destroyFormWidget();
				return;
			}
		}
		if(this.formListCount != this._store.getRowSet().getRowCount()){
			this.formListCount = this._store.getRowSet().getRowCount();
			//首先清空ContainerNode下的节点
			this._destroyFormWidget();
			var len=this._store.getRowSet().getRowCount(),
			str=[];
			var div = dojo.create('div');
			for(var i=0;i<len;i++){
				str.push("<div dojoType='unieap.form.Form'>");
				str.push(this.originNodeHTML);
				str.push("</div>");
				div.innerHTML= str.join("");
				this.containerNode.appendChild(div.childNodes[0]);
				str = [];
			}
			div = null;
			dojo.parser.parse(this.containerNode, {xhr:true, currentDataCenter:this.dataCenter || (unieap.Action.getViewContext(this) || window).dataCenter});
		}
		var self=this;
		if(this.showLoading)
		   dojo.style(this.contentLoading ,'display','none');
//		setTimeout(function(){
		//临时解决控件渲染后数据显示慢的问题
		self._bindData(self._store);
//		},0);
	},


	//数据绑定
	_bindData:function(store){
		var binding = this.getBinding();
		var self = this;
		dojo.query(" > [widgetId]",this.containerNode).map(dijit.byNode).forEach(function(form,index){
			form.rowIndex=index;
			form.getBinding().setDataStore(store,index);
			if(index == 0){
				dojo.query("input[type ='radio']", form.domNode).forEach(function(input){
					if(dojo.hasAttr(input,'name')){
						self.radioNameArray.push(dojo.attr(input, "name"));
					}
				});
				dojo.query("[tabIndex]", form.domNode).forEach(function(input){
					if(dojo.attr(input, "tabIndex") > 0){
						self.tabIndexArray.push(dojo.attr(input, "tabIndex"));
					}
				});
			}
			if(index > 0){
				binding.reNameRadio(form.domNode, self.radioNameArray, index);
				binding.reNameTabIndex(form.domNode, self.tabIndexArray, self.count, index);
			}
		});
	},   
	// 在添加和删除行后更新受影响的formIndex、radioName和tabIndex
	_upDateFormIndex : function(currIndex){
		var binding = this.getBinding();
		var self = this;
		dojo.query(" > [widgetId]",this.containerNode).map(dijit.byNode).forEach(function(form,index){
			form.rowIndex=index;
			if(index >= currIndex){
				binding.reNameRadio(form.domNode, self.radioNameArray, index);
				binding.reNameTabIndex(form.domNode, self.tabIndexArray, self.count, index);
			}
		});
	},
	
	//添加删除行后更新formListCount
	_upDateFormListCount : function(){
		this.formListCount = this._store.getRowSet().getRowCount();
	},
	
	//销毁处理操作
	destroy:function(){
		this.getBinding().destroy();
		this.inherited(arguments);
	}
})
dojo.provide('unieapx.form.FormListBinding');
dojo.declare("unieapx.form.FormListBinding",null, {

	/**
	 * @declaredClass: unieap.form.FormListBinding
	 * @summary: FormList控件数据绑定模块
	 * @example: |<div dojoType="unieap.form.FormList"
	 *           binding="{store:'empDs'}"> | <div
	 *           dojoType="unieap.form.TextBox" binding="{name:'address'}"></div> |</div>
	 */

	/**
	 * @summary: 设置FormList控件所绑定的DataStore
	 * @type: {unieap.ds.DataStore|string}
	 * @example: |<div dojoType="unieap.form.FormList"
	 *           binding="{store:'empDs'}"> | <div
	 *           dojoType="unieap.form.TextBox" binding="{name:'address'}"></div> |</div>
	 */
	store: null,

	constructor: function(params) {
		dojo.mixin(this, params);
		this.store=(this.widget.dataCenter || (unieap.Action.getViewContext(this.widget) || window).dataCenter).getDataStore(this.store);
		this.connects=[];
		this.store&&this.store.getRowSet()&&this._bindTrigger();
	},

	/**
	 * @summary: 获得FormList控件绑定的DataStore对象
	 * @return: {unieap.ds.DataStore}
	 * @example: |<script type="text/javascript"> | var
	 *           formList=unieap.byId('formList'), |
	 *           ds=formList.getBinding().getDataStore(); | unieap.debug(ds); |</script>
	 */
	getDataStore:function(){
		return this.store;
	},

	// 事件触发
	_bindTrigger:function(){
		if(typeof(this.store) == "undefined" || this.store == null){
			return;
		}
		var rowset=this.store.getRowSet();
	
		this.connects.push(dojo.connect(rowset,'onAfterAddRow',this,function(row){
			var count = rowset.getRowCount();
			if(count==1 && this.widget.insertBlankRow){
				// this.widget._createForm();
				return;
			}
			var div=dojo.create('div'),form_id;
			div.innerHTML='<div dojoType="unieap.form.Form">'+this.widget.originNodeHTML+"</div>";
			dojo.parser.parse(div, {xhr:true, currentDataCenter:this.widget.dataCenter || (unieap.Action.getViewContext(this.widget) || window).dataCenter});
			form_id=div.childNodes[0].id;
			// 为formlist增加id
			// this.widget._initWidgetId(div.childNodes[0], rowset.getRowCount());
			var currIndex = row.getIndex();
			if(currIndex + 1 == count){
				this.widget.containerNode.appendChild(div.childNodes[0]);
			}else{
				this.widget.containerNode.insertBefore(div.childNodes[0], this.widget.containerNode.childNodes[currIndex]);
			}
			div=null;
			unieap.byId(form_id).getBinding().bind(row);
			this.widget._upDateFormIndex(currIndex);
			this.widget._upDateFormListCount();
		}));

		this.connects.push(dojo.connect(rowset,'onBeforeDeleteRow',this,function(rowIndex){
			if (rowset.getRowCount() == 1 && this.widget.insertBlankRow) {
				return;
			}
			var childNodes = this.widget.containerNode.childNodes;
			// unieap.destroyWidgets(childNodes[rowIndex]);
			var widgets = dojo.query("[widgetId]",childNodes[rowIndex]).map(dijit.byNode);
			for(var i=widgets.length-1,formWidget;formWidget=widgets[i];i--){
				if(formWidget.destroy){
					formWidget.destroy();
				}
				else if(formWidget.id){
					dijit.registry.remove(formWidget.id);
				}
			}
			this.widget.containerNode.removeChild(childNodes[rowIndex]);
			this.widget._upDateFormIndex(rowIndex);
		}));

		// 删除Row时的监听
		this.connects.push(dojo.connect(rowset,'onAfterDeleteRow',this,function(row){
			// // FIXME:
			// 能否得到删除的序号,直接删除该序号对应的Form即可,不用重新删除Form再创建
			if (rowset.getRowCount() == 0 && this.widget.insertBlankRow){
				// rowset.insertRow({}, 0);
				// this.widget.getForm(0).getBinding().setDataStore(rowset.getDataStore());
				this.widget._createForm();
			}
			this.widget._upDateFormListCount();
		}));
		
		// 删除全部Row时的监听
		this.connects.push(dojo.connect(rowset,'onAfterDeleteAllRows',this,function(row){
			if (rowset.getRowCount() == 0){
				this.widget._createForm();
			}
			this.widget._upDateFormListCount();
		}));
	},



	// 销毁监听
	disconnect:function(){
		dojo.forEach(this.connects,function(item){
			dojo.disconnect(item);
		});
		this.connects=[];
	},


	destroy:function(){
		this.disconnect();
	},


	// 对radio进行处理
	reNameRadio:function(form, originRadioArr, index){
		var k = 0;
		dojo.query("input[type ='radio']", form).forEach(function(input){
			if(dojo.hasAttr(input,'name')){
				    var srcName = originRadioArr[k];
					var desName = srcName;
					for(var i = 0; i < index; i++){
						desName = desName + "_" + srcName;
						if(i == index-1){break;}
					}
					dojo.attr(input,"name", desName);
					k++;
			}
		});
	},
	// 对tabIndex进行处理
	reNameTabIndex : function(form, orginTabIndexArr, count, index){
		var k = 0;
		dojo.query("[tabIndex]", form).forEach(function(input){
			if(dojo.attr(input, "tabIndex") > 0){
				dojo.attr(input, "tabIndex", Number(orginTabIndexArr[k]) + count * index);
				k++;
			}
		});
	},

	/**
	 * @summary: 重新设置FormList控件绑定的DataStore
	 * @param: {unieap.ds.DataStore} store 要重新绑定的DataStore 对象
	 * @example: |<script type="text/javascript"> | var
	 *           ds=dataCenter.getDataStore('emp'), |
	 *           formList=unieap.byId('formList'); |
	 *           formList.getBinding().setDataStore(ds); |
	 *           unieap.debug(formList.getBinding().getDataStore()); |</script>
	 */
	setDataStore:function(store){
		if(!store instanceof unieap.ds.DataStore) return
		this.disconnect();
		this.store=store;
		this._bindTrigger();
		this.widget._createForm();
	}
});
dojo.provide("unieapx.form.QuickSearchPopup");
dojo.require("unieap.form.ComboBoxPopup");
dojo.declare("unieapx.form.QuickSearchPopup", unieap.form.ComboBoxPopup, {

	displayStyle: "table",
	onSelect : function(item, widget) {
		var ds = new unieap.ds.DataStore( {
			pageSize : 10,
			pageNumber : 1,
			recordCount : 1, 
			name : "qs_result",
			rowSetName : this.widget.getDataProvider().store.rowSetName,
			rowSet : [ item ]
		});
		var me = this.widget;
//		me.setValue(item[me.getBinding().name]);
		me.setValue(item[me.getDecoder().valueAttr]);
		me._selectStore = ds;
		me.onComplete(ds);
		me._toogleIcon();
		me._selectedText = this._getSelectedText();
//		me._isClearing=true;
		me._hasValue = true;
//		if (!me.bindable) {
//			me.clear();
//		}
//		setTimeout(function(){
////			dijit.byId((this._rootID||"")+this.nextFocusId)||dijit.byId(this.nextFocusId)?this.processNextFocusId():dojo.byId("unieap_for_focus").focus();
//			me._isClearing = false;
//		},200);
		if(!me.textValidate)
			me.getDataProvider().setDataStore(null);
		// if(unieap.isUserStyle){
		// 	if(unieap.currentStyle == 'network'){
				if(dojo.isIE){
					document.getElementById(this.params.widget.id + '_unieap_input').focus();
				}
		// 	}
		// }
	},
	
	_onClick: function(evt) {
		var me = this.widget;
		me._isClick = true;
		setTimeout(function(){
			me._isClick = false;
		},200);
		this.inherited(arguments);
	},
	
	_getSelectedText: function(){
		var selectedText = '',me = this.widget;
		selectedText =  this._selection?me.getDecoder().decode(this._selection[0]):me.getText();
		if(selectedText == '' ||selectedText ==null )selectedText=me.getText();
		return selectedText;
	},
	
	_clearSelection: function(){
		if(this._selection) {
			this._selection[0] = null;
			this._selection = null;
			this.widget._selectedText = '';
			this.widget._isSetText=false;
		}
	},
	
	_isSelecting: function(){
		if (this._selection && this._selection[0]){
			return true;
		}else{
			return false;
		}
	},
	
	open: function(items, selection, callback) {
		if(!this.widget._isClick){
			this._clearSelection();
		}
		if(this.isOpen() || (('undefined' == typeof this.widget.getDataProvider().store) || !this.widget.getDataProvider().store)) return;
		this.widget._oldValue = this.widget.getText();
		this.inherited(arguments);
	},
	
	/**
	 * @summary:
	 * 		关闭下拉框
	 */
	close: function(callback) {
		if (this.isOpen()) {
			var me = this.widget;
			if(this.animation&&this.animation.status() == "playing"){
				this.animation.stop();
			}
			if (this._isShowingNow) {
				this._isShowingNow = false;
				dojo.style(this.popupcontainer, "display", "none");
				var iframe = this._iframe;
				if (iframe) {
					iframe.style.width = "0px";
					iframe.style.height = "0px";
				}
			}
			if (me.bindable) {
				if(this._isSelecting()){
					if(me._selectedText == '') me._selectedText = this._getSelectedText();
					me.setText(me._selectedText);
				}else{
					if(me.onlySelect){
						if(!me._isDelayQuery){
							me.setValue('');
							this.widget._oldValue = '';
						}
					}else{
						me.setValue(this.widget._oldValue);
					}
				}
			}else{
				if(!me._isDelayQuery){
					me.setValue("");
				}
				me._tooglePrompt();
			}
			if(!me.textValidate)
				me.getDataProvider().setDataStore(null);
		}
	}

});
dojo.provide("unieapx.form.QuickSearchAutoCompleter");
dojo.require("unieap.form.AutoCompleter");
dojo.declare("unieapx.form.QuickSearchAutoCompleter", unieap.form.AutoCompleter, {

	UserInterfaces : dojo.mixin( {
		url : "string"
	}, unieap.form.AutoCompleter.prototype.UserInterfaces),

	onBeforeSendQuery : function(params, dc) {
		if(this.widget.onBeforeSendQuery){
			var params = this.widget.onBeforeSendQuery(dc,arguments[2]);//wangc
			if(params && this._isJson(params)){
				return  params;
			}
		}
		return {};
	},
	
	_sendQuery:function(sQuery,unBindStore,isSetValue){
		var me=this;
	    if(this._canSendQuery(sQuery)){
	    	var quicksearchStore = me.widget.quicksearchStore;
	    	var quicksearchConfig = me.widget.quicksearchConfig;
	    	if(quicksearchStore && quicksearchConfig){
    			var dataSource = me.widget.quicksearchConfig["dataSource"];
    			this._getQueryResult(sQuery,unBindStore,quicksearchStore,dataSource,isSetValue);
	    	}else{
	    		me.widget._getQuicksearchConfig("setValue",sQuery,unBindStore,isSetValue);
	    	}
	    }
	},
	
	_getQueryResult:function(sQuery,unBindStore,quicksearchStore,dataSource,isSetValue){
		var me=this;
		if(isSetValue && me.widget.getDecoder().valueAttr == me.widget.getDecoder().displayAttr){
			me.widget._setValue(sQuery);
			!me.widget.readOnly && me.widget.getValidator().validate();
		}else{
			var url=unieap.WEB_APP_NAME+ "/techcomp/ria/commonProcessor?page="+unieap.WEB_PAGE_NAME;
			var dc=new unieap.ds.DataCenter();
			dc.setParameter("_boId", "quicksearch_QuickSearchBOImpl_bo");
			dc.setParameter("_methodName", "query");
			dc.setParameter("_methodParameterTypes", "java.lang.String,java.lang.String,com.viewhigh.vadp.sysbase.quicksearch.entity.QuickSearch,boolean,java.util.Map");
			dc.setParameter("id", me.widget.config);
			dc.setParameter("keyword", sQuery);
			
//		var quicksearchStore = me.widget.quicksearchStore;
			dc.addDataStore("config", quicksearchStore);
			if(isSetValue){
				dc.setParameter("isSetValue", true);
			}else{
				dc.setParameter("isSetValue", false);
			}
//		var dataSource = me.widget.quicksearchConfig["dataSource"];
			if(dataSource && dataSource != ""){
				dc.setParameter("_dataSourceID", dataSource);
			}
			//可以在此回调方法中重新修改已有参数或者增加其他参数
			var params = me.onBeforeSendQuery(me.params,dc);
			dc.setParameter("params", params);
			var p1 = "",p2 = "";
			for(var key  in params){
				p1+=(","+key);
				p2+=",string";
				dc.setParameter(key, params[key]);
			}
			if(p1.length>1)
				p1 = p1.substr(1);
			if(p2.length>1)
				p2 = p2.substr(1);
			dc.setParameter("_parameters", "id,keyword,config,isSetValue,params("+p1+")");
			dc.setParameter("_parameterTypes", "string,string,pojo,string,map("+p2+")");
			unieap.Action.requestData({
				url:url,
				sync:false,
				load:function(dc){
				if(me.widget._isQuerySucceed(dc)){
					me._showResult(dc,unBindStore,sQuery);
					me.onAfterSendQuery(dc);
				}
			}
			},dc,false);//fasle表示不显示loading
		}
	},

	_showResult : function(dc,unBindStore,sQuery) {
		var store = dc.getSingleDataStore();
		var rowCount = store.getRowSet().getRowCount("primary");
		
		/* S 修改 */
//		if (rowCount == 0) {
//			debugger;
//			var _widget = this.widget;
//			this.widget.onComplete(null);
//			//在弹出提示进行clear操作
//			_widget.clear();
//			
//			if(!this.widget._isDelayQuery){
//				MessageBox.alert( {
////					title : "提示信息", // MODIFY BY TENGYF
//					title : RIA_UNIEAPX_I18N.form.infoTilte,
////					message : "未查询到数据!"
//					message : RIA_UNIEAPX_I18N.form.notFoundData,
//					onComplete : function(){
//						//_widget.clear();
//						_widget.focus();
//					}
//				});
////			}
//			return;
//		}
//		if (store.getRowSet().getRowCount("primary") > 1)
//			return this.inherited(arguments);
//		this.widget.getDataProvider().setDataStore(store);
//		//获取选中行数据；
//		this.widget._selectStore = store;
//		this.widget._isSetText = true;
//		if(unBindStore){
//			this.widget._setValue(sQuery);
//			!this.widget.readOnly && this.widget.getValidator().validate();
//			this.widget.getDataProvider().setDataStore(null);
//		}
//		else{
//			this.widget.setSelectedIndex([0]);
//			var item = dc.getSingleDataStore().rowSet.getData()[0];
//			this.widget.setValue(item[this.widget.decoder.valueAttr]);
//			this.widget.getPopup().onSelect(item, this.widget);
//			this.widget.getPopup().close();
//		}
		/* E 修改 */
		
		// if(unieap.isUserStyle){
			if(unBindStore){
				this.widget.getDataProvider().setDataStore(store);
				//获取选中行数据；
				this.widget._selectStore = store;
				this.widget._isSetText = true;
				this.widget._setValue(sQuery);
				!this.widget.readOnly && this.widget.getValidator().validate();
				this.widget.getDataProvider().setDataStore(null);
			} else{
				this.inherited(arguments);
			}
		// }
		
	},

	_canSendQuery : function(value) {
		if (value == "")
			return true;
		if (value)
			return true;
		return false;
	},
	
	_isJson :function(obj){ 
	    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; 
	    return isjson; 
	} 


});
dojo.provide("unieapx.form.QuickSearch");
dojo.require("unieap.form.ComboBox");
dojo.declare("unieapx.form.QuickSearch", unieap.form.ComboBox, {

	UserInterfaces : dojo.mixin( {
		config : "string",
		autoDialog:"boolean",
		detailDialog : "string",
		onClear : "function",
		onBeforeQuery : "function",
		onComplete : "function",
		bindable : "boolean",
		onlySelect: "boolean",
		onBeforeSendQuery : "function"
	}, unieap.form.ComboBox.prototype.UserInterfaces),

	popupClass : "unieapx.form.QuickSearchPopup",
	width : "300px",
	/**
	 * @summary:
	 * 		选择选中的值后是否不清空控件
	 * @description:
	 * 		如果设置为false时，可以在onSelect事件中处理业务逻辑，而控件实际的值会被清空
	 * @type：
	 * 		{boolean}
	 */
	bindable : true,
	
	//是否支持手动输入
	onlySelect: true,
	
	/**
	 * @summary:
	 * 		自定义查询对话框id
	 * @description:
	 * 		可以自定义查询对话框，精确查找数据，该项为配置自定义查询对话框id
	 * @type：
	 * 		{string}
	 */
	detailDialog:"",
	
	iconClass : "quicksearchIcon",
	textValidate : false,
	comboShowSelect : false,
	
	//弹出窗口Dialog对象
	_dlg : null,
	//是否是用鼠标点击选中
	_isClick: false,
	//通过绑定数据和quicksearch查询只有一条数据直接赋值时，设置_isSetText为true
	_isSetText: false,
	//标示控件是否是通过选择得到的值，非选择得到的值在onBlur时清空控件的值
	_hasValue: false,
	
	
//	_isClearing: false,
	_selectedText: '',
	_oldValue:'',
	
	//--------------------------王凡--------------------------------------------
	autoDialog:true,
	_autoDialogModel:"formQuery",
	_autoDialogContent:null,
	quicksearchConfig:null,
	quicksearchStore:null,
	_autoDialog:null,
	_autoDialogGrid:null,
	_autoDialogQuery:null,
	_autoDialogGridPane:null,
	_autoDialogQueryPane:null,
	_autoDialogQueryButton:null,
	_autoDialogSelectButton:null,
	_autoDialogToolbar:null,
	_autoDialogPageSize:10,
	_autoDialogDataFormat:"yyyy-MM-dd",
	
	
	
	constructor: function(inView) {
		this.inherited(arguments);
	},

	postCreate : function() {
		this.connects = [];
		this._tooglePrompt();
		this._toogleIcon();
		this.connects.push(dojo.connect(this.getBinding(),'bind',this,'_bindText'));
		if(!this.bindable) this.onlySelect = false;
		this.inherited(arguments);
		this.autoDialog && this._getQuicksearchConfig();
		
//		if(unieap.isUserStyle){
//			if(unieap.currentStyle == 'network'){
//				var _this = this;
//				if(_this.detailDialog == ""){
//					var dataHtml = "<a href='javascript:void(0)' class='u-form-textbox-icon dataIconClick'></a>";
//					$(_this.iconNode).after(dataHtml);
//					$(_this.fieldNode).on('click','.dataIconClick',function(e){
//						_this._onKeyDown(e,'evtCodeClick');
//					})
//				}
//			}
//		}
	},
	
	_bindText: function(row){
		if(!row) return;
		this._onBindChange(row, true);
		if(0 == row.getRowSet().getRowCount()){
			this.getPopup()._clearSelection();
		}
	},
	
	_onBindChange: function(row, isbindText){
		var self = this;
		if(row.isItemChanged(self.getBinding().name) || ('undefined' != typeof isbindText) && true == isbindText){
			setTimeout(function(){
				var items = self.getDataProvider().getItems();
				if(self.onlySelect &&row.getItemValue(self.getBinding().name)&&self.inputNode && self.getText() ){
					//通过绑定数据和quicksearch查询只有一条数据直接赋值时，设置_isSetText为true
					self._isSetText = true;
				}else{
					self._isSetText = false;
				}
			},0);
		}
	},
	
	/*--------------------------wu.zb-------------------------------------*/
	_timeOut:null,//延迟发送数据请求的setTimeout处理
	_isDialogType:true,//是否是弹窗查询类型

	_isDelayQuery:true,
	_selectStore:null,
	delayTime:1,
	
	getSelectStore:function(){
		var displayAttr = this.getDecoder().displayAttr;
		var textValue = this.getText();
		if(textValue!=""){
			if(this._selectStore){
				var storeValue = this._selectStore.getRowSet().getItemValue(0,displayAttr);
				if(storeValue == textValue){
					return this._selectStore;
				}
			}
			return null;
		}else{
			return null;
		}
	},
	
	_openAutoQueryFlag:function(value,evt){
		var _self = this;
		var keyCode = evt.keyCode;
		if(keyCode != dojo.keys.ENTER && keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.TAB){
			this._timeOut = setTimeout(function(){
							_self._doAutoQuery(value);
					}, _self.delayTime*1000);
		}
	},
	
	_closeAutoQueryFlag:function(){
		clearTimeout(this._timeOut);
	},
	
	_doAutoQuery:function(value){
			this.getAutoCompleter()._sendQuery(value);
	},
	
	_onKeyUp:function(evt){
		if(this.disabled){
			dojo.stopEvent(evt);
			return;
		}
		if(this.onlySelect){
			var keyCode = evt.keyCode;
			if( ((this._isSetText && this.getText()!="" && !this.getPopup().isOpen()) || 
			    (keyCode != dojo.keys.ENTER &&this.getPopup()._isSelecting())) && 
			    ( keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.TAB)
					){
				dojo.stopEvent(evt);
				return ;
			}
		}
		if(this._isDelayQuery && this.getText() != ""){
			this._openAutoQueryFlag(this.getText(),evt);
		}
		
		this.inherited(arguments);
	},
	
	_onKeyDown: function(evt,type) {
		if(this.disabled){
			dojo.stopEvent(evt);
			return;
		}
		/* S 修改 */
//		if(this.onlySelect){
//			var keyCode = evt.keyCode;
//			if( ((keyCode==dojo.keys.BACKSPACE && this.iconClass == "lemis-icon-formqsdel") || (this._isSetText && this.getText()!="" && !this.getPopup().isOpen()) || 
//				    (keyCode != dojo.keys.ENTER &&this.getPopup()._isSelecting())) && 
//				    ( keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.TAB)
//						){
//				dojo.stopEvent(evt);
//				return ;
//			}
//			if(keyCode == dojo.keys.ENTER){
//				this.getPopup()._handleKeyDown(evt);
//				if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
//				this._keyPressed = true;
//				this._hasBlur = false;
//				return;
//			}
//		}
//		if(this._isDelayQuery){
//			this._closeAutoQueryFlag();
//		}
//		this.inherited(arguments);
		/* E 修改 */
		
		if(this.onlySelect){
			var keyCode = evt.keyCode;
			// if(unieap.isUserStyle){
			// 	if(unieap.currentStyle == 'network'){
					if(type == 'evtCodeClick'){
						keyCode = 13;
					}
			// 	}
			// }
			//var keyCode = evt.keyCode;
			if(keyCode!=dojo.keys.DOWN_ARROW 
					&& keyCode!=dojo.keys.UP_ARROW 
					&& keyCode!=dojo.keys.TAB
					&& keyCode != dojo.keys.ENTER
			){
				this.values = [];
				//this._updateText();
				this.fireDataChange();
				if(false){
					this.getCascade().cascade();
				}
				//this.setIconClass("lemis-icon-formqsfind");
				
				this._isSetText = false;
				this._hasValue = false;
			}
			if(keyCode == dojo.keys.ENTER){
				if (this.iconClass == 'lemis-icon-formqsfind' || this.iconClass == 'dataIconClick') {
//					lemis-icon-formqsfind-dis
//					dataIconClick
//					u-form-textbox-icon
					this.getPopup()._handleKeyDown(evt);
					if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
					this._keyPressed = true;
					this._hasBlur = false;
					return;
				} else {
					if(this.getPopup() && this.getPopup().isOpen()){
						this.getPopup()._handleKeyDown(evt);
						if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
						this._keyPressed = true;
						this._hasBlur = false;
						return;
					}else{
						this._enter2Tab(evt);
						return;
					}
				}
			}
		}
		if(this._isDelayQuery){
			this._closeAutoQueryFlag();
		}
		this.inherited(arguments);
	},

	_interestInKeyCode : function(evt) {
		var keyCode = evt.keyCode;
		var popUpWidget = this.getPopup()
		if(popUpWidget.isOpen() && keyCode!=dojo.keys.DOWN_ARROW && keyCode!=dojo.keys.UP_ARROW && keyCode!=dojo.keys.ENTER ){
				if(!this._isDelayQuery){
					popUpWidget._clearSelection();
				}
				this._oldValue = this.getText();
				popUpWidget.close();
		}
		if(keyCode = dojo.keys.ENTER){
			return null;
		}else{
			return !((keyCode<2 && keyCode!=dojo.keys.BACKSPACE)
					|| (keyCode>=33 && keyCode<=46) 
					|| (keyCode>=112 && keyCode<=123)
					|| (evt.ctrlKey&&keyCode==65));
		}
	},

	setValue: function(value){
		if ((value === "" || value ===undefined)&& !this._isClick) {
			value = null;
			this.getPopup()._clearSelection();
		}
		if(this.getDecoder().valueAttr != this.getDecoder().displayAttr && this.getDataProvider().getDataStore() == null && value!=null){
			this.getAutoCompleter()._sendQuery(value,true,true);
		}else{
			this._setValue(value);
			!this.readOnly && this.getValidator().validate();
		}
	},
	
	onEnter : function(evt) {
		dojo.stopEvent(evt);
		if(this.disabled) return;
		if(this.iconClass == "lemis-icon-formqsdel") return false;
		/* 修改 */
//		if (this.readOnly || ((this.onlySelect) && this.getPopup()._isSelecting() && this.inputNode && this.getText()))
//			return true;
		/* 修改 */
		var p = this.getPopup();
		if (!p._selection || p._selection.length == 0 || p._selection[0][this.getDecoder().displayAttr] != this.getText() || this.getDataProvider().getDataStore() == null){
			if(this.autoDialog && !this.quicksearchConfig){
				this._getQuicksearchConfig("popup");
				return false
			}else{
				this._closeAutoQueryFlag();
				this.getAutoCompleter()._sendQuery(this.getText());
				return false
			}
		}
		return true;
	},

	_onFocus : function(evt) {
		if(evt == undefined || evt == null){
			return;
		}
		if(this.disabled){
			dojo.stopEvent(evt);
			return;
		}
		this._tooglePrompt();
		this._hasBlur = false;
	},

	_onBlur : function(evt) {
		if(this.inputNode.value == ""){
			this.clear();
		}
		if (this.bindable) {
			this.inherited(arguments);
//			this.setValue(this.getText());
//			this.fireDataChange();
		}else{//不绑定数据的quicksearch当焦点离开的时候要设置为“”，然后在_tooglePrompt中改为提示信息
			this.setText("");
		}
//		if(this._hasBlur) return;
		if(this.onlySelect){
			if(this.values && this.values.length == 0){
				this.setValue("");
			}
			/*else{
				if(this.getText()!='' &&  !this._hasValue && !this._isDelayQuery)	{
					this.setValue("");
				}
			}*/
		}
		this._tooglePrompt();
		if (!this.readOnly && this._interestInBlur(evt)) {
			 this.getValidator().validate();
		}
		this._hasBlur = true;

	},
	
	onBeforeShowDialog : function(dlg){
		//wangc
		this.getAutoCompleter().onBeforeSendQuery(this.getAutoCompleter().params,null,this._getDialog());
		return true;
	},

	getAutoCompleter : function() {
		return unieap.getModuleInstance(this, "autoCompleter", "unieapx.form.QuickSearchAutoCompleter");
	},

//	getValue : function() {
//		return this.getText();
//	},

	_onIconClick : function(evt) {
		debugger;
		if(this.disabled || this.readOnly){
			dojo.stopEvent(evt);
			return;
		}
		if(this.getPopup().isOpen()) {
			dojo.stopEvent(evt);
			// @YangLingling 关闭弹窗
			this.getPopup().close();
			return;
		}
		if (this.iconClass == "lemis-icon-formqsdel") {
			if (this.onClear)
				this.onClear(evt);
			this.clear();
			/////////////////sun
			this.getPopup()._clearSelection();
		} else if (this.detailDialog) {
			var dlg = this._getDialog();
			if(dlg && this.onBeforeShowDialog && this.onBeforeShowDialog(dlg))
				this._getDialog().show();
		}else if(this.autoDialog){
			if(!this.quicksearchConfig)
				this.quicksearchConfig = this._getQuicksearchConfig("dialog");
			else{
				this._createAutoDialog(this.quicksearchConfig,this.config);
                // @sxf 点击icon触发enter展示下拉框
                if(unieap.fireEvent(this,this.onEnter,[evt])==false) return;
			}
		}
	},

	_changeValue: function(value,isBind) {
		if(this.onlySelect){
			if(this.values && this.values.length == 0){
				this.setValue("");
			}
		}
		//this.values = value==null?[]:value.toString().split(this.separator);
		this._updateText();
		this.fireDataChange();
		if(!isBind){
			this.getCascade().cascade();
		}
	},
	

	setText : function(value) {
		this.inherited(arguments);
		this._toogleIcon();
	},

	_toogleIcon : function() {
		// if(unieap.isUserStyle){
			if(this.bindable){
				if (this.getText() == "" || (this.getPromptManager() && this.getPromptManager().promptMsg && this.getText() == this.getPromptManager().promptMsg)) {
					this.setIconClass((this.autoDialog && (this.detailDialog || this._isDialogType))?"lemis-icon-formqsfind":"dataIconClick");
				} else {
					this.setIconClass("lemis-icon-formqsdel");
				}
				/*
				 * 判断detailDialog是否为空
				 * 为空标识没有设置开启弹层项，就隐藏查询图标
				 */
				if(this.detailDialog == ""){
					//this.setIconClass("lemis-icon-formqsdel");
//					this.iconNode.style.display="none";
//					this.iconNode.style.visibility="hidden";
				}
			}else{
				this.setIconClass((this.autoDialog && (this.detailDialog || this._isDialogType))?"lemis-icon-formqsfind":"dataIconClick");	
				/*
				 * 判断detailDialog是否为空
				 * 为空标识没有设置开启弹层项，就隐藏查询图标
				 */
				if(this.detailDialog == ""){
//					this.iconNode.style.display="none";
//					this.iconNode.style.visibility="hidden";
				}
			}
		// }
		
		// 源码
//		if(this.bindable){
//			if (this.getText() == "" || (this.getPromptManager() && this.getPromptManager().promptMsg && this.getText() == this.getPromptManager().promptMsg)) {
//				this.setIconClass((this.autoDialog && (this.detailDialog || this._isDialogType))?"lemis-icon-formqsfind":"lemis-icon-formqsfind-dis");
//			} else {
//				this.setIconClass("lemis-icon-formqsdel");
//			}
//		}
//		else
//			this.setIconClass((this.autoDialog && (this.detailDialog || this._isDialogType))?"lemis-icon-formqsfind":"lemis-icon-formqsfind-dis");	
	},

	_tooglePrompt : function(widget) {
		if(!widget)
			widget=this;
		if (!widget.bindable && widget.getPromptManager() && widget.getPromptManager().promptMsg) {
			if (widget.focused) {
				if (widget.getText() == widget.getPromptManager().promptMsg) {
					dojo.removeClass(widget.inputNode, "quicksearchPrompt");
					widget.setText("");
				}
			} else {
				if (widget.getText() == "" && !widget.getPopup().isOpen()) {
					dojo.addClass(widget.inputNode, "quicksearchPrompt");
					widget.setText(widget.getPromptManager().promptMsg);
				}
			}
		}
	},
	
	clear : function() {
		this.setValue(null);
		this.setText(null);
		this._isSetText = false;
		this._hasValue = false;
	},

	_getDialog : function() {
		if (!this._dlg) {
			this._dlg = unieap.byId(this._rootID ? this._rootID + this.detailDialog : this.detailDialog);
			if(this._dlg == undefined && _currentNodeOfSingleFrame && _currentNodeOfSingleFrame.id){
				this._dlg = unieap.byId(_currentNodeOfSingleFrame.id + this.detailDialog);
				this._dlg.domNode.notApplyWidget=true;
			}
			var me = this;
			this._dlg.onComplete = function(ds) {
				if (ds) {
					if(!(ds instanceof unieap.ds.DataStore)) ds = unieap.fromJson(ds);
					me.setText(ds.getRowSet().getItemValue(0, me.getDecoder().displayAttr));
					me.setValue(ds.getRowSet().getItemValue(0, me.getDecoder().valueAttr));
//					!me.readOnly && me.getValidator().validate();
					me.onComplete(ds);
					if (!me.bindable) {
						me.clear();
					}
					me._tooglePrompt();
				}
			}
		}
		return this._dlg;
	},
	
	onComplete: function(){
	},
	destroy: function(){
		while(this.connects.length){
			dojo.disconnect(this.connects.pop());
		}
		if(this.autoDialog){
			this.destroyAutoDialog();
		}
		this.inherited(arguments);
	},
	
	
	destroyAutoDialog:function(){
		if(this._autoDialogGrid){
			this._autoDialogGrid.destroy();
			this._autoDialogGrid=null;
		}
		if(this._autoDialogQuery){
			this._autoDialogQuery.destroy();
			this._autoDialogQuery=null;
		}
		if(this._autoDialogGridPane){
			this._autoDialogGridPane.destroy();
			this._autoDialogGridPane=null;
		}
		if(this._autoDialogQueryPane){
			this._autoDialogQueryPane.destroy();
			this._autoDialogQueryPane=null;
		}
		if(this._autoDialogQueryButton){
			this._autoDialogQueryButton.destroy();
			this._autoDialogQueryButton=null;
		}
		if(this._autoDialogSelectButton){
			this._autoDialogSelectButton.destroy();
			this._autoDialogSelectButton=null;
		}
		if(this._autoDialogToolbar){
			this._autoDialogToolbar.destroy();
			this._autoDialogToolbar=null;
		}
		if(this._autoDialog){
			this._autoDialog.destroy();
			this._autoDialog=null;
		}
	},
	
	//王凡添加
	_getQuicksearchConfig:function(type,sQuery,unBindStore){
		var config = this.config;
		if(!config) return;
		var _self = this;
		var url=unieap.WEB_APP_NAME+ "/techcomp/ria/commonProcessor?page="+unieap.WEB_PAGE_NAME;
	    var dc=new unieap.ds.DataCenter();
		dc.setParameter("_boId", "quicksearch_QuickSearchBOImpl_bo");
		dc.setParameter("_methodName", "getQuickSearch");
		dc.setParameter("_methodParameterTypes", "java.lang.String");
		dc.setParameter("id", config);
	    dc.setParameter("_parameters", "id");
	    dc.setParameter("_parameterTypes", "string");
	    unieap.Action.requestData({
	    	url:url,
	    	sync:true,
	    	load:function(dc){
			    if(_self.domNode && _self._isQuerySucceed(dc)){
			    	_self.quicksearchStore = dc.getSingleDataStore();
			    	var row = dc.getSingleDataStore().getRowSet().getRow(0);
			    	if(row){
				    	var max = row.getItemValue("max");
				    	var dialogMax = row.getItemValue("dialogMax");
				    	var structure = row.getItemValue("structure");
				    	var queryConfig = row.getItemValue("queryConfig");
				    	var valueAttr = row.getItemValue("valueAttr");
				    	var displayAttr = row.getItemValue("codeAttr");
				    	var queryMode = row.getItemValue("queryMode");
				    	var dialogType = row.getItemValue("dialogType");
				    	var dataSource = row.getItemValue("dataSource");
				    	var popupWidth = row.getItemValue("popupWidth");
				    	var codeAttrConfig = row.getItemValue("codeAttrConfig");
				    	if(codeAttrConfig){
				    		if(!_self.quicksearchConfig){
				    			_self.quicksearchConfig = {};
				    		}
				    		_self.quicksearchConfig["codeAttrConfig"] = codeAttrConfig;
				    	}
				    	var valueAttrConfig = row.getItemValue("valueAttrConfig");
				    	if(valueAttrConfig){
				    		if(!_self.quicksearchConfig){
				    			_self.quicksearchConfig = {};
				    		}
				    		_self.quicksearchConfig["valueAttrConfig"] = valueAttrConfig;
				    	}
//				    	var queryHql = row.getItemValue("queryHql");
//				    	var querySql = row.getItemValue("querySql");
//				    	
//				    	if(queryHql){
//				    		if(!_self.quicksearchConfig){
//				    			_self.quicksearchConfig = {};
//				    		}
//				    		_self.quicksearchConfig["queryHql"] = queryHql;
//				    	}else if(querySql){
//				    		if(!_self.quicksearchConfig){
//				    			_self.quicksearchConfig = {};
//				    		}
//				    		_self.quicksearchConfig["querySql"] = querySql;
//				    	}
				    	
				    	//展现模式：form或者advanceQuery
				    	var model = row.getItemValue("dialogType") || "formQuery";
				    	if(max){
				    		if(!_self.quicksearchConfig){
				    			_self.quicksearchConfig = {};
				    		}
				    		_self.quicksearchConfig["max"] = max;
				    	}
				    	if(dataSource){
				    		if(!_self.quicksearchConfig){
				    			_self.quicksearchConfig = {};
				    		}
				    		_self.quicksearchConfig["dataSource"] = dataSource;
				    	}
				    	if(dialogMax){
				    		_self._autoDialogPageSize = dialogMax;
				    	}
				    	if(structure){
				    		try{
				    			structure = dojo.fromJson(structure);
				    			if(!_self.quicksearchConfig){
				    				_self.quicksearchConfig = {};
				    			}
				    			_self.quicksearchConfig["structure"] = structure;
				    			_self.getPopup().setStructure(structure);
				    		}catch(e){
				    		}
				    	}
				    	if(popupWidth){
				    		_self.getPopup().width = popupWidth;
				    	}
				    	if(queryConfig){
				    		try{
				    			queryConfig = dojo.fromJson(queryConfig);
				    			if(!_self.quicksearchConfig){
				    				_self.quicksearchConfig = {};
				    			}
				    			_self.quicksearchConfig["queryConfig"] = queryConfig;
				    		}catch(e){
				    		}
				    	}
				    	if(model){
				    		_self.quicksearchConfig["model"] = model;
				    		_self._autoDialogModel = model;
				    	}
				    	_self._isDialogType = dialogType == null?false:true;
				    	_self._toogleIcon();
				    	if(queryMode){
				    		_self.quicksearchConfig["queryMode"] = queryMode;
				    		_self._isDelayQuery = queryMode=="enterQuery"?false:true;
				    	}
				    	if(valueAttr&&displayAttr){
				    		var d = _self.getDecoder();
				    		d.valueAttr= valueAttr;
				    		d.displayAttr= displayAttr;
				    	}
				    	if(type=="dialog"){
				    		_self._createAutoDialog(_self.quicksearchConfig,_self.config);
				    	}else if(type=="popup"){
				    		_self.getAutoCompleter()._sendQuery(_self.getText());
				    	}else if(type=="setValue"){
				    		_self.getAutoCompleter()._getQueryResult(sQuery,unBindStore,_self.quicksearchStore,dataSource,true);
				    	}
			    	}
				}
	    	}
	    },dc,false);
	},
	
	
	_getAutoDialogGrid:function(advanceQueryConfig){
		if(!this._autoDialogGrid){
			//显示行号
			var vm = {rowNumber: true,onRowClick:dojo.hitch(this,this._selectRow),onRowDblClick :dojo.hitch(this,this._doubleSelectRow)};
			//单选
			var selection={selectType:'single'};
			var binding = {rpc:dojo.hitch(this,this._bindingRpc)};
			var columns = [];
			//cell宽度
			var width = "150px";
			for(var key in advanceQueryConfig){
				if(advanceQueryConfig[key]["displayItem"]){
					var cellConfig = {};
					cellConfig["name"] = advanceQueryConfig[key]["sqlAttr"] || key||"";
					cellConfig["label"] = advanceQueryConfig[key]["label"]||"";
					cellConfig["width"] = advanceQueryConfig[key]["width"]||width;
					columns.push(cellConfig);
				}
			}
	        var header={rows:[columns]}
			var layout = [header];
			var grid = new unieap.xgrid.Grid({
				views: vm,
				selection:selection,
				binding:binding,
				height:"100%",
				layout: {structure:layout}
			});
			this._autoDialogGrid = grid;
		}
		return this._autoDialogGrid;
	},
	
	_getAutoDialogGridPane:function(config,boId,grid,advanceQuery){
		if(!this._autoDialogGridPane){
			var pane = new unieap.layout.TitlePane({
				title:"查询结果",
				height:"100%",
				flexible:false
			});
			this._autoDialogGridPane = pane;
		}
		if(!this._autoDialogSelectButton){
			this._autoDialogSelectButton = new unieap.form.Button({
				label:"选择",
				onClick:dojo.hitch(this,this._autoDialogSelect),
				config:boId,
				pageSize:config["max"]
			});
			dojo.place(this._autoDialogSelectButton.domNode,this._autoDialogGridPane.buttonContainerNode,0);
		}
		return this._autoDialogGridPane;
	},
	
	_getAutoDialogQueryPane:function(grid,advanceQuery,quicksearch,model){
		if(!this._autoDialogQueryPane){
			var pane = new unieap.layout.TitlePane({
				title:"查询条件",
				flexible:false
			});
			this._autoDialogQueryPane = pane;
		}
		if(!this._autoDialogQueryButton){
			this._autoDialogQueryButton = new unieap.form.Button({
				label:"查询",
				onClick:dojo.hitch(this,this._autoDialogQueryFun)
			});
			dojo.place(this._autoDialogQueryButton.domNode,this._autoDialogQueryPane.buttonContainerNode,0);
		}
		return this._autoDialogQueryPane;
	},
	
	_getAutoDialogQuery:function(advanceQueryConfig,model){
		if(!this._autoDialogQuery){
			if(model=="formQuery"){
				this._autoDialogQuery = this._createFormQuery(advanceQueryConfig);
			}else{
				var config = {};
				for(var name in advanceQueryConfig){
					if(advanceQueryConfig[name].queryItem){
						config[name]=advanceQueryConfig[name];
					}
				}
				this._autoDialogQuery = new unieapx.query.AdvancedQuery({
					config:config,
					showQueryToolBar:false
				});
			}
		}
		return this._autoDialogQuery;
	},
	
	
	
	
	
	_createWidget:function(name,config){
		var str="<td width=\"20%\">" + config["label"]+"</td><td width=\"30%\">";
		var store = config.store;
		var dataType = config.dataType;
		// 下拉列表和下拉树
		if(store != null && store != ""){
			widget = this._createSelectedWidget(name,config);
		}else{
			switch(dataType){
				case unieap.DATATYPES.BIGINT :
					widget = this._createIntegerWidget(name,config);
					break;
				case unieap.DATATYPES.BOOLEAN :
					widget = this._createSelectedWidget(name,config);
					break;
				case unieap.DATATYPES.DATE :
					widget = this._createDateWidget(name,config);
					break;
				case unieap.DATATYPES.DECIMAL :
					widget = this._createNumberWidget(name,config);
					break;
				case unieap.DATATYPES.DOUBLE :
					widget = this._createNumberWidget(name,config);
					break;
				case unieap.DATATYPES.FLOAT :
					widget = this._createNumberWidget(name,config);
					break;
				case unieap.DATATYPES.INTEGER :
					widget = this._createIntegerWidget(name,config);
					break;
				case unieap.DATATYPES.LONGVARCHAR :
					widget = this._createStringWidget(name,config);
					break;
				case unieap.DATATYPES.NUMERIC :
					widget = this._createNumberWidget(name,config);
					break;
				case unieap.DATATYPES.REAL :
					widget = this._createNumberWidget(name,config);
					break;
				case unieap.DATATYPES.SMALLINT :
					widget = this._createIntegerWidget(name,config);
					break;			
				case unieap.DATATYPES.STRING :
					widget = this._createStringWidget(name,config);
					break;
				case unieap.DATATYPES.TIME :
					widget = this._createDateWidget(name,config);
					break;		
				case unieap.DATATYPES.TIMESTAMP :
					widget = this._createTimestampWidget(name,config);
					break;
				case unieap.DATATYPES.TINYINT :
					widget = this._createIntegerWidget(name,config);
					break;
				case unieap.DATATYPES.VARCHAR :
					widget = this._createStringWidget(name,config);
					break;
				default :
					widget = this._createStringWidget(name,config);
			}
		}
		str+= widget + "</td>";
		return str;
	},
	
	_createNumberWidget:function(name,config){
		return "<div dojoType='unieap.form.NumberTextBox' width=\"100%\" binding=\"{name:'"+ name +"'}\"></div>"
	},
	_createIntegerWidget:function(name,config){
		return "<div dojoType='unieap.form.NumberTextBox' width=\"100%\" binding=\"{name:'"+ name +"'}\" rang=\"{allowDecimal:false}\"></div>"
	},
	_createStringWidget:function(name,config){
		return "<div dojoType='unieap.form.TextBox' width=\"100%\" binding=\"{name:'"+ name +"'}\"></div>"
	},
	_createTimestampWidget:function(name,config){
		return "<div dojoType='unieap.form.DateTextBox' width=\"100%\" binding=\"{name:'"+ name +"'}\" popup=\"{showsTime:24}\" displayFormatter=\"{dataFormat:"+ this._autoDialogDataFormat+"}\"></div>"
	},
	_createDateWidget:function(name,config){
		return "<div dojoType='unieap.form.DateTextBox' width=\"100%\" binding=\"{name:'"+ name +"'}\"></div>"
	},
	// 构造下拉列表类型组件。
	_createSelectedWidget:function(name,config){
		var displayAttr = config.displayAttr||"CODENAME";
		var valueAttr = config.valueAttr||"CODEVALUE";
		return "<div dojoType='unieap.form.ComboBox' width=\"100%\" binding=\"{name:'"+ name +"'}\" decoder=\"{displayAttr:'" + displayAttr +"',valueAttr:'" + valueAttr +"'}\" dataProvider=\"{store:'"+config.store+"'}\"></div>"
	},
	
	
	_createFormStore:function(advanceQueryConfig){
		var store = new unieap.ds.DataStore("_autoDialogFormDataStore");
	    var data = {};
	    var result={};
	    var count = 0;
		for(var name in advanceQueryConfig){
			if(advanceQueryConfig[name].queryItem){
				var alias = advanceQueryConfig[name].alias;
				if(alias){
					name = alias +"." + name;
					
				}
				data[name] = ""
				count++
			}
		}
		store.getRowSet().addRow(data);
		result.store =store;
		result.count = count;
		return result;
	},
	_createFormQuery:function(advanceQueryConfig){
		var result = this._createFormStore(advanceQueryConfig);
		var store = result.store;
		var count = result.count;
		var form = new unieap.form.Form({});
		var index = 0;
		var formHtml ="<table width=\"100%\">" ;
		for(var name in advanceQueryConfig){
			if(advanceQueryConfig[name].queryItem){
				index++;
				if(index == 1){
					formHtml+="<tr>";
				}
				var alias = advanceQueryConfig[name].alias;
				var allName = name;
				if(alias){
					allName = alias +"." + name;
					
				}
				formHtml += this._createWidget(allName,advanceQueryConfig[name]);
				if(index == 2){
					formHtml+="</tr>";
					index=0;
				}
			}
		}
		formHtml +="</table>";
		var formNode = form.domNode;
		formNode.innerHTML = formHtml;
		dojo.parser.parse(formNode);
		form.getBinding().setDataStore(store);
		return form;
	},
	
	_getAutoDialogTool:function(grid){
		if(!this._autoDialogToolbar){
			dojo.require("unieap.xgrid.core.toolbar");
			this._autoDialogToolbar = new unieap.xgrid.toolbar({
				grid:grid
			});
		}
		return this._autoDialogToolbar;
	},
	
	_createAutoDialog:function(config,boId){
		var _this = this;
		this.destroyAutoDialog();
		if(!this._autoDialog){
			if(!config) return;
			var advanceQueryConfig = config["queryConfig"];
			if(!advanceQueryConfig) return;
			var autoDialogHeight = "530";
			this._autoDialog = new unieap.xdialog.Dialog({
				id:"_quicksearchAutoXDialogId",
				title:"快速搜索",
				iconCloseComplete: true,
				height:autoDialogHeight,
				width:"600",
				onComplete : function(){
					_this.focus();
				}
			});
			this._autoDialog.show();
			var adaptiveContainer = new unieap.layout.AdaptiveContainer();
			var queryPane = new unieap.layout.AdaptivePane();
			var gridPane = new unieap.layout.AdaptivePane({
				autoHeight:true
			});
			var advanceQuery = this._getAutoDialogQuery(advanceQueryConfig,this._autoDialogModel);
			var queryTitle = this._getAutoDialogQueryPane(grid,advanceQuery,this,this._autoDialogModel);
			queryTitle.addChild(advanceQuery);
			var grid = this._getAutoDialogGrid(advanceQueryConfig);
			var gridTitle = this._getAutoDialogGridPane(config,boId,grid,advanceQuery);
			var toolbar = this._getAutoDialogTool(grid);
			grid.advanceQuery = advanceQuery;
			grid.toolBar = toolbar;
			gridTitle.addChild(grid);
			queryPane.addChild(queryTitle);
			gridPane.addChild(gridTitle);
			adaptiveContainer.addChild(queryPane);
			adaptiveContainer.addChild(gridPane);
			adaptiveContainer.placeAt(this._autoDialog.dialogMainContent);
			adaptiveContainer.notifyResize();
			this._autoDialog.domNode.notApplyWidget = true
		}else{
			this._autoDialog.show();
		}
	},
	
	_selectRow:function(evt){
		this._getAutoDialogGrid().getManager("SelectionManager").setSelect(evt.rowIndex,true);
	},
	_doubleSelectRow:function(evt){
		this._getAutoDialogGrid().getManager("SelectionManager").setSelect(evt.rowIndex,true);
		this._autoDialogSelect();
	},
	
	_bindingRpc:function(store,load,grid){
		var pageNumber = store.getPageNumber();
		var pageSize = store.getPageSize();
		this._setAutoDialogGridStore(this,pageNumber,pageSize);
	},
	
	_autoDialogSelect:function(){
		var selectedRows=this._getAutoDialogGrid().getManager('SelectionManager').getSelectedRows();
		if(selectedRows && selectedRows[0]){
			var value = selectedRows[0].getItemValue(this.getDecoder().valueAttr);
			if(value){
				var store = new unieap.ds.DataStore('quicksearch_autoDialog_datastore');
				store.getRowSet().addRow(selectedRows[0].getData());
				this.getDataProvider().setDataStore(store);
				//获取选中行数据；
				this._selectStore = store;
				this.setValue(value);
				this._isSetText = true;
				this.onComplete(store);
			}
		}
		if (!this.bindable) {
			this.clear();
		}
		this._tooglePrompt();
		this.focus();
		this._autoDialog.close();
		this.getDataProvider().setDataStore(null);
	},
	
	_autoDialogQueryFun:function(){
		this._setAutoDialogGridStore(this,1,this._autoDialogPageSize);
	},
	
	_setAutoDialogGridStore:function(quicksearch,pageNumber,pageSize){
		var url=unieap.WEB_APP_NAME+ "/techcomp/ria/commonProcessor!commonMethod.action?t=" + new Date().getTime();
	    var dc=new unieap.ds.DataCenter();
	    var advanceQuery = this._autoDialogQuery;
	    var dataSource = this.quicksearchConfig["dataSource"]
	    if(advanceQuery){
	    	if(this._autoDialogModel =="formQuery"){
	    		var store = advanceQuery.getBinding().getDataStore();
				dc.setParameter("_boId", "ria_quickSearchBO_bo");
				dc.setParameter("_methodName", "queryByFormCondition");
				dc.setParameter("_methodParameterTypes", "com.neusoft.unieap.techcomp.ria.quicksearch.dto.QuickSearch,java.util.Map,int,int,java.util.Map");
				dc.addDataStore("_autoDialogFormQueryStore", store);
				dc.setParameter("pageNumber",pageNumber);
				dc.setParameter("pageSize",pageSize);
				dc.addDataStore("config", this.quicksearchStore);
     			if(dataSource && dataSource != ""){
     				dc.setParameter("_dataSourceID", dataSource);
     			}
     			// add by lugj 增加弹出查询对onBeforeSendQuery的支持
    			var params = this.getAutoCompleter().onBeforeSendQuery(this.getAutoCompleter().params,dc);
    			dc.setParameter("params", params);
    			var p1 = "",p2 = "";
    			for(var key in params){
    				p1+=(","+key);
    				p2+=",string";
    				dc.setParameter(key, params[key]);
    			}
    			if(p1.length>1)
    				p1 = p1.substr(1);
    			if(p2.length>1)
    				p2 = p2.substr(1);
    			dc.setParameter("_parameters", "config,_autoDialogFormQueryStore,pageNumber,pageSize,params("+p1+")");
 			    dc.setParameter("_parameterTypes", "pojo,pojo,string,string,map("+p2+")");
 			    
			    unieap.Action.requestData({
			    	url:url,
			    	sync:false,
			    	load:function(dc){
					    if(quicksearch._isQuerySucceed(dc)){
					    	quicksearch._getAutoDialogGrid().getBinding().setDataStore(dc.getSingleDataStore());
						}
			    	}
			    },dc,false);
	    	}else{
			    var store = advanceQuery._queryGrid.getBinding().getDataStore();
				var conditionDS = advanceQuery._transformCondition(store);
			    dc.addDataStore(conditionDS);
				dc.setParameter("_boId", "ria_quickSearchBO_bo");
				dc.setParameter("_methodName", "queryByAdvanceCondition");
				dc.setParameter("_methodParameterTypes", "com.neusoft.unieap.techcomp.ria.quicksearch.dto.QuickSearch,int,int,java.util.Map");
				dc.setParameter("pageNumber",pageNumber);
				dc.setParameter("pageSize",pageSize);
				dc.addDataStore("config", this.quicksearchStore);
			    if(dataSource && dataSource != ""){
     				dc.setParameter("_dataSourceID", dataSource);
     			}
				// add by lugj 增加弹出查询对onBeforeSendQuery的支持
    			var params = this.getAutoCompleter().onBeforeSendQuery(this.getAutoCompleter().params,dc);
    			dc.setParameter("params", params);
    			var p1 = "",p2 = "";
    			for(var key  in params){
    				p1+=(","+key);
    				p2+=",string";
    				dc.setParameter(key, params[key]);
    			}
    			if(p1.length>1)
    				p1 = p1.substr(1);
    			if(p2.length>1)
    				p2 = p2.substr(1);
    			dc.setParameter("_parameters", "config,pageNumber,pageSize,params("+p1+")");
   			    dc.setParameter("_parameterTypes", "pojo,string,string,map("+p2+")");
   			    
			    unieap.Action.requestData({
			    	url:url,
			    	sync:false,
			    	load:function(dc){
					    if(quicksearch._isQuerySucceed(dc)){
					    	quicksearch._getAutoDialogGrid().getBinding().setDataStore(dc.getSingleDataStore());
						}
			    	}
			    },dc,false);
	    	}
	    }

	},
	
	_isQuerySucceed:function(dc){
		if (dc && dc.declaredClass == "unieap.ds.DataCenter"&& dc.getCode() >= 0) {
			return true;
		}else{
			var _this = this;
			dojo.require("unieap.dialog.MessageBox");
			MessageBox.alert({
				// 错误提示
				title : "错误提示",
				// "查询失败" ,
				message : "查询失败",
				onComplete : function(){
					_this.clear();
					_this.focus();
				}
			});
			return false;
		}
	}

});
dojo.provide("unieapx.exception.Handler");
unieapx.exception.Handler = {
		
	getBusinessExceptionType: function(){
		return 'businessException';
	},
	getSystemExceptionType: function(){
		return 'sytemException';
	},
	handleBusinessException : function(dc) {
		this._displayBusinessException(dc, unieapx.exception.Handler.getBusinessExceptionType());
	},
	handleSystemException : function(dc) {
		this._displayException(dc, unieapx.exception.Handler.getSystemExceptionType());
	},
	_displayException : function(dc, exType) {
		var dialog = DialogUtil.showDialog( {
			dialogData : {
				dc : dc,
				exType : exType
			},
			url : unieap.WEB_APP_NAME
					+ "/techcomp/ria/unieapx/exception/error.jsp",
			title : RIA_UNIEAPX_I18N.exception.title,
			height : "118",
			width : "400",
			isExpand:false,
			resizable:false
		});
//		dialog.show();
	},
	
	_displayBusinessException:function(dc, exType) {
//		MessageBox.alert({title:'确认框',message:dc.header.message.title}); // MODIFY BY TENGYF
		if(unieap.recordScript){
			unieap.exceptionScriptDC = dc;
		}
		var messageTip=dc.header.message.title?dc.header.message.title:"系统服务异常";
		MessageBox.alert({title:RIA_UNIEAPX_I18N.exception.confirmTitle,message:messageTip});
	}

};
dojo.provide("unieapx.layout.NavigatorContainer");
dojo.require("unieap.layout.TabController");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");
dojo.declare("unieapx.layout.NavigatorContainer", [unieap.layout.Container,dijit._Templated], {
    /**
     * @declaredClass:
     * 		unieap.layout.TabContainer
     * @superClass:
     * 		unieap.layout.Container
     * @summary:
     * 		Tab容器
     * @classDescription：
     * 		Tab容器，以ContentPane作为其子容器。
     * 		可以指定Tab的显示位置。
     * @example:
     * |<div dojoType="unieap.layout.TabContainer"   tabPosition="left-h">
     * |	<div dojoType="unieap.layout.ContentPane" title="Tab1">
     * |		Hello Tab1!
     * |	</div>
     * |	<div dojoType="unieap.layout.ContentPane" title="Tab2">
     * |		Hello Tab2!
     * |	</div>
     * |</div>
     *
     */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		tabPosition : "string",
		baseClass : "string",
		autoSwitchTab: "boolean",
		isCollectMenu:"boolean",
		collectMenu: "function",
		onAfterSelectChild: "function",
		onBeforeSelectTab: "function"
	},
	unieap.layout.Container.prototype.UserInterfaces),	
	
    templateString: "<div class='tabContainer'>" +
						"<div dojoAttachPoint='tabNest' class=\"navigatorContainer-nest\">" +
    					"<div dojoAttachPoint='tablistContainer' class='navigator-scrolling-container'>"+
    						"<div dojoAttachPoint='collectMenuNode' class='navigatorBtn collectMenuNode'></div>"+
    						"<div dojoAttachPoint='refreshNode' class='navigatorBtn refreshNode'></div>"+
							"<div class='navigator-scrolling' dojoAttachPoint='scrollingNode'>"+
								"<div dojoAttachPoint='tablistNode'>" +
									"<div dojoAttachPoint='backNode' class='disableBackDiv'></div>"+
									"<div dojoAttachPoint='nextNode' class='disableNextDiv'></div>"+
								"</div>"+
							"</div>"+
						"</div>" +
    					"<div dojoAttachPoint='tablistSpacer' class='navigatorSpacer' style='dispaly:none;'></div>" +
    					"<div class='navigatorWrapper'  dojoAttachPoint='containerNode' style='overflow:hidden;'></div>" +
						"</div>" +
    				"</div>",
	
	/**
	 * @summary:
	 * 		Tab标签的位置
	 * @description:
	 * 		控制Tab标签的位置,默认为上
	 * @default：
	 * 		"top"
	 * @type:
	 * 		{string}
	 * @enum:
	 * 		{"top"|"bottom"|"left-h"|"right-h"}		
	 */
    tabPosition: "top",
    
    /**
	 * @summary:
	 * 		自动切换到鼠标移动到的tab页
	 * @description:
	 * 		控制Tab页是否鼠标移动其上，能够自动切换到相应的页
	 * @default：
	 * 		false
	 * @type:
	 * 		{boolean}
	 */
    autoSwitchTab : false,
	
    baseClass: "navigatorContainer",
	
	//_Widget里的startup()方法维护了此属性
//	_started: false,
	
	/**
	 * @summary:
	 * 		Tab的默认高度
	 * @default：
	 * 		"400px"
	 * @type:
	 * 		{string}		
	 */
	height:'auto',
	
	scroll:null,
	
	navigatorList: null,
	
	closedNavigatorList: null,
	
	currentTitle: "",
	
	_canRefresh: true,
	
	showNavigator: (typeof(unieap.widget.navigator.showNavigator) == 'undefined')?true:unieap.widget.navigator.showNavigator,
	
	alwaysShowNavigator: (typeof(unieap.widget.navigator.alwaysShowNavigator) == 'undefined')?true:unieap.widget.navigator.alwaysShowNavigator,
   
	onCompletePrePage : false,
	
	_afterLoadPage:null,
	
	isCollectMenu:false,
	
	
	_menuNode:null,
	_menuNodeHandle:null,
	
	setOnCompletePrePage : function(onCompletePrePage){
		this.onCompletePrePage = onCompletePrePage;
	},
	getOnCompletePrePage : function(){
		return this.onCompletePrePage;
	},
	
	tablistsize:40+2 , //tab butotn的高度 + 1px tabSpacer
	
	getScroll: function() {
		return unieap.getModuleInstance(this,"scroll","unieap.layout.TabScrollProvider");
	},
    
	postCreate: function(){
		this.inherited(arguments);
		if(!unieap.bootstrapMenu){
			this.tablistsize = 24;
		}
		this.navigatorList = [];
		this.navigatorSubscribe = [];
		this.closedNavigatorList = [];
		var pos = this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "");
		this.baseClass += pos;
		dojo.addClass(this.domNode, this.baseClass); 	//tabContainerTop
		dojo.addClass(this.tablistContainer,'navigator-scrolling-container'+pos);
		dojo.isIE!=6&&dojo.addClass(this.tablistSpacer,'tabSpacer'+pos);
		dojo.addClass(this.containerNode,'navigatorWrapper'+pos);
		
        //创建TabController
        dojo.require("unieapx.layout.NavigatorController");
        var NavigatorController = dojo.getObject("unieapx.layout.NavigatorController");
        this.tablist = new NavigatorController({
            id: this.id + "_tablist",
            tabPosition: this.tabPosition,
            container: this,
            autoSwitchTab : this.autoSwitchTab,
			style:"height:'100%'",
            "class": this.baseClass + "-tabs" ,//tabContainerTop-tabs
            onBeforeSelectTab: this.onBeforeSelectTab
        }, this.tablistNode);
        /*
         * 解决第一次展现页面时多个tab页面的信息瞬间显示在同一个页面的问题
         * U_EAP00019316
         */
        dojo.forEach(this.containerNode.children,function(child){
        	dojo.style(child,"display","none");
        },this);
        this.connects = [];
        this.connects.push(dojo.connect(this.backNode,'onclick',this,'prePage'));
        this.connects.push(dojo.connect(this.refreshNode,'onclick',this,'refresh'));
        this.connects.push(dojo.connect(this.collectMenuNode,'onclick',this,'collectMenu')); 
         this.connects.push(dojo.connect(this.collectMenuNode,'onmouseover',this,'setStarInfoTip')); 
		if(!this.showNavigator){
			dojo.style(this.tablistContainer, "display", "none");
		}
		else if(!this.alwaysShowNavigator){
			dojo.style(this.tablistContainer, "display", (this.navigatorList.length <= 1)?"none":"block");
		}
//		this.collectMenuStar(this.isCollectMenu);	
    },
    
    collectMenuStar:function(isCollected){ 
    	if(isCollected == true){
    		dojo.removeClass(this.collectMenuNode,"collectMenuNode");
    		dojo.addClass(this.collectMenuNode,"collectMenuNodeSelect");
//    		dojo.style(this.collectMenuNode,"color","#ffc40d");
		}else if(isCollected == false){
    		dojo.addClass(this.collectMenuNode,"collectMenuNode");
    		dojo.removeClass(this.collectMenuNode,"collectMenuNodeSelect");
//    		dojo.style(this.collectMenuNode,"color","#000");
		}else{
		}
    },
    setCollectMenuStar:function(obj){ 
    	this.collectMenuStar(obj);
    },
    // 鼠标悬停在星星上时 给出提示信息
     setStarInfoTip:function(){ 
//    	if(this.isCollectMenu){
//    		this.collectMenuNode.title = "修改此页的收藏夹";
//    	}else{
//    		this.collectMenuNode.title = "为此页添加收藏";
//    	}
	this.collectMenuNode.title = "菜单收藏";
    },
    
        // 弹出收藏夹编辑对话框
    collectMenu:function(){
    	this.createDialog();
    }, 
    // 创建对话框
    createDialog:function(){
 		var menuId = null;
 		var pageId = unieap.getTopWin()._currentSelectedPageId;// childMenu.js
 		menuId = pageId.substring(5);// 获取menuId,pageId = "page_" + meunId
 		var title = unieap.getTopWin()._currentSelectedPageTitle;
 			// 创建对话框
 			var dialog = XDialogUtil.createDialog({	
 				url: unieap.WEB_APP_NAME + "/techcomp/ria/menuFavoriteDialog-view.jsp",
 				title:"已收藏的菜单",
 				dialogData:{title:title,menuId:menuId},
 				height:"150",
 				width:"300",
 				isExpand:false,
 				onComplete:dojo.hitch(this,this.setCollectMenuStar)
 			});	
 			dialog.show();
    },
    
	/**
	 * @summary:
	 * 		点击Tab页前触发的事件
	 * @param:
	 * 		{object} contentPane Tab页,目前只接收unieap.layout.ContentPane对象
	 * @return
	 * 		Boolean 返回false则不加载点击的Tab页
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="tabcontainer" style="height:200px;" onBeforeSelectTab="fn">
	 * |function fn(contentPane){
	 * |	unieap.debug(contentPane);
	 * |    return false;
	 * |}
	 */
	onBeforeSelectTab: function(contentPane){
	},
	
	onAfterSelectChild: function(page, oldPage){
	},
	
	onBeforeRefresh: function(){
	},
	
	_setupChild: function(/* Widget */child){
        dojo.addClass(child.domNode, "tabPane");
		dojo.style(child.domNode, "overflow","auto");
		dojo.style(child.domNode, "position","relative");
		
		//去掉鼠标悬停时的title显示
		child.domNode.title = "";
		//add 修改孩子widget的_inTabContainer属性
		if("_inTabContainer" in child) {
			child._inTabContainer=true;
			child.tabContainer = this;
		} 
    },
    
   startup: function(){
		if(!this._started) {
			//目前此方法是空实现（wire up the tablist and its tabs ）
	        this.tablist.startup();	
			
			var children = this.getChildren();
			// 每个孩子page的初始化
			dojo.forEach(children, this._setupChild, this);
			dojo.some(children, function(child){
				if(child.selected){
					this.selectedChildWidget = child;
				}
				return child.selected;
			}, this);
			
			var selected = this.selectedChildWidget;
			if(!selected && children[0]){
				selected = this.selectedChildWidget = children[0];
				selected.selected = true;
			}
	
			//发布startup()事件
			dojo.publish(this.id+"-startup", [{children: children, selected: selected}]);
			
			this.layout();
			//执行选中某节点时会进行resizeContainer
			if(selected) {
				this._showChild(selected);
			}
			this._started = true;
			for(var i=0; i<children.length; i++){
				if(children[i].hidden){
					this.hideTabButton(children[i]);
				}
				/*
				 * @author
				 * 		zhengh
				 * @sumarry
				 * 		初始化Tab容器时，将enabled属性为false的Tab页设置为不可编辑
				 */
				if(!children[i].enabled){
					this._disableTabButton(children[i]);
				}
			}
		}
		this.inherited(arguments);
    },
	
	resizeContainer: function() {
		if(null == this.domNode) return;
		this.resize();
		this.resizeChildrenContainer();
//		this._showMenuNode();
	},
	
	notifyParentResize: function() {
	},
	
	resize: function() {
		this.layout();
	},
	
	_interestShowNavigator: function(){
		if(!this.alwaysShowNavigator && this.showNavigator){
			var displayCss = dojo.style(this.tablistContainer, "display");
			dojo.style(this.tablistContainer, "display", this.navigatorList.length <= 1?"none":"block");
			if(displayCss != dojo.style(this.tablistContainer, "display")){
				this.layout();
			}
		}
	},
	layout: function() {
		if(this.domNode.offsetHeight == 0) { return;}
		this._calculaBorder();
		var pos = this.tabPosition.replace(/-.*/, "");
		var tablistsize = this.tablistsize;
		if(this.navigatorList.length <= 1 && !this.alwaysShowNavigator){
			tablistsize = 0;
		}
		if(!this.showNavigator){ //U_EAP00029239
			tablistsize = 0;
		}
		if(pos == 'left' || pos == 'right') {
//			this.containerNode.style.width = this.domNode.clientWidth - this.tablistsize + 'px';
			var h = this._adjustSize(this.domNode.clientHeight - 2*this.borderSize);
			this.containerNode.style.height = h;
			this.tablistContainer.style.height = h;
		} else if(pos == 'bottom') {
			dojo.place(this.tablistContainer,this.tabNest,'last');
			dojo.place(this.tablistSpacer,this.tablistContainer,'before');
			if(this.height!="auto"){
				this.containerNode.style.height = this._adjustSize(this.domNode.clientHeight - tablistsize);
			}
		} else { // top
			if(this.height!="auto"){
				this.containerNode.style.height = this._adjustSize(this.domNode.clientHeight - tablistsize - this.borderSize);
			}
		}
		
		//如果contentPane没设置高度，则高度为100%
		if(this.height!="auto"&&this.selectedChildWidget && this.selectedChildWidget instanceof unieap.layout.Container) {
			this.selectedChildWidget.setHeight('100%');
		} 
		
		this.getScroll().calculateScroll();
	},
	
	
	// 校正计算值
	_adjustSize: function(size) {
		if(size < 0) {
			return '0px';
		} else {
			return size + 'px';
		}
	},
	
	_calculaBorder: function() {
		//CSS1Compat  引DOCTYPE
		//BackCompat  未引DOCTYPE
		if(dojo.isIE && dojo.doc.compatMode == "BackCompat") {//IE下，在不引DOCTYPE的情况下，border不占宽度
			this.borderSize = 0;
		} else {
			this.borderSize = 1;
		}
	},
	
	/**
	 * @summary:
	 * 		增加一个Tab页
	 * @param:
	 * 		{object} page Tab页,目前只接收unieap.layout.ContentPane对象
	 * @param:
	 * 		{object} insertIndex 插入的位置
	 * @param:
	 * 		{boolean} needselected 是否增加一个Tab页后就选择该Tab页，默认选中
	 * @example:
	 * |unieap.byId('createTab').addChild(new unieap.layout.ContentPane({
	 * |	title: "新增的Tab页"
	 * |}));
	 */
	addChild:function(page,insertIndex,needSelected){
		this.navigatorList.push(page);
		this.test = "abc"+page.id;
		
		if (!page instanceof unieap.layout.ContentPane) {
			return;
		}
		typeof(needSelected)=='undefined'&&(needSelected=true);
		needSelected=!!needSelected
		page._inTabContainer=true;
		if(this.getIndexOfChild(page)!=-1){
			this.selectChild(page)
		}else{
			this.inherited(arguments);
			if(this._started){
				dojo.publish(this.id+"-addChild", [page, insertIndex]);
				this.layout();
				//选中新增page
				if(needSelected){
					this.selectChild(page);
				}else{
					dojo.removeClass(page.domNode, "unieapVisible");
					dojo.addClass(page.domNode, "unieapHidden");
				}
			}
		}
		this._interestShowNavigator();
	},
	/**
	 * @summary:
	 * 		删除一个Tab页
	 * @param:
	 * 		{object} page Tab页,目前只接收unieap.layout.ContentPane对象
	 * @example:
	 * |var pane = unieap.byId('aContentPane');
	 * |unieap.byId('aTabContainer').removeChild(pane);
	 */
	removeChild: function(/*Widget*/ page){
		// Overrides Container.removeChild() to do layout and publish events
//		this.inherited(arguments);
		
		
		// If we are being destroyed than don't run the code below (to select another page), because we are deleting
		// every page one by one
		if(this._beingDestroyed){ return; }

		if(this._started){
			// this will notify any tablists to remove a button; do this first because it may affect sizing
			dojo.publish(this.id+"-hideTabButton", [page]);

			this.getScroll().calculateScroll();
		}
		//如果被删除节点是当前选中节点，在删除后将TabContainer第一个子节点选中
		if(this.selectedChildWidget === page){
			this.selectedChildWidget = undefined;
			if(this._started){
				var children = this.getChildrenNotHidden();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},
	
	/**
	 * @summary:
	 * 		选择某个Tab页
	 * @description
	 * 		注意参数不是index,而是contentPane对象
	 * @param: 
	 * 		{object} page contentPane对象
	 * @example:
	 * |var contentPane = unieap.byId("contentpane1");
	 * |unieap.byId("tabContainer").selectChild(contentPane);
	 */
	selectChild:function(page){
		//可以接受id或JS对象
		var page = unieap.byId(page);
		//隐藏的page，不能选中
		if(page.hidden == true) {
			return;
		}
		if(this.selectedChildWidget){
			//原TabButton取消选中状态
			var oldButton=this.tablist.pane2button[this.selectedChildWidget];
			oldButton.setSeleted(false);
		}
		//设置TabButton选中状态
		var newButton=this.tablist.pane2button[page];
		newButton.setSeleted(true);
		if(this.selectedChildWidget != page){
			var oldpage = this.selectedChildWidget;
			this.selectedChildWidget = page;
			this._transition(page, oldpage);
			this._doSelect(page);
			this._changeBackClass();
			//dojo.publish(this.id+"-selectNavigator", [page]);
			this.onAfterSelectChild(page, oldpage);
		}
//		this.getSroll().isShowing&&this.getScroll().needScroll(page);
	},
	
	_doSelect: function(page){
		var navigatorPane = this.navigatorList.pop();
		while(page != navigatorPane && this.navigatorList.length>0){
			page.getParentContainer().removeChild(navigatorPane);
			this.closedNavigatorList.push(navigatorPane);//保留已经打开的页面；
			navigatorPane = this.navigatorList.pop()
		}
		this.navigatorList.push(navigatorPane);
		if(navigatorPane._navigatorPaneSubscribe && navigatorPane._navigatorPaneSubscribe[page.parentContainer.title]){
			   if(!this.getOnCompletePrePage() && navigatorPane._navigatorPaneSubscribe[page.parentContainer.title].onCompleteByClick){
					navigatorPane._onComplete = navigatorPane._navigatorPaneSubscribe[page.parentContainer.title].method;
					navigatorPane._onComplete(null);					
			   }				  
		}				
		page.parentContainer.title=this.getSelectedTab().title;
		this._interestShowNavigator();
	},
	
	/**
	 * @summary:
	 * 		打开已经打开过的NavigatorPane
	 * @param: 
	 * 		{string} href NavigatorPane的href
	 */
	openPane: function(href, dc, title){
		if(0 == this.closedNavigatorList.length) return false;
		var closedPane = this.closedNavigatorList.pop();
		var tempClosedPaneList = [];
		//遍历查找关闭的navigatorPane是否存在将要打开的pane
		while(href != closedPane.href && this.closedNavigatorList.length>0){
			tempClosedPaneList.push(closedPane);
			closedPane = this.closedNavigatorList.pop();
		}
		
		for(var i = 0, l = tempClosedPaneList.length; i < l; ++i){
			this.closedNavigatorList.push(tempClosedPaneList.pop());
		}
		
		if(href == closedPane.href){
			closedPane.data = dc;
			if(dc && dc.declaredClass === "unieap.ds.DataCenter"){
				closedPane.origparameters = {};
				for(var a in closedPane.parameters){
					closedPane.origparameters[a] = dc.parameters[a];
				}
			}
			closedPane.currentTitle = closedPane.title = title; //U_EAP00029238
			this.addChild(closedPane);
			dojo.publish(this.id+"-showTabButton", [closedPane]);
			closedPane.controlButton.setTitle(title);
			return true;
		}else{
			this.closedNavigatorList.push(closedPane);
		}
		return false;
	},
	
	_changeBackClass: function(){
		if(this.navigatorList.length > 1){
			!dojo.hasClass(this.backNode,"backDiv") && dojo.addClass(this.backNode,"backDiv");
			dojo.removeClass(this.backNode,"disableBackDiv");
		}else{
			!dojo.hasClass(this.backNode,"disableBackDiv") && dojo.addClass(this.backNode,"disableBackDiv");
			dojo.removeClass(this.backNode,"backDiv");
		}
		this._interestShowNavigator();
	},
	
	prePage: function(dc){
		if(1 == this.navigatorList.length) return;
		var navigatorPane = this.navigatorList.pop(),
			selectedNavigatPane = this.navigatorList.pop();
		this.navigatorList.push(selectedNavigatPane);
		this.navigatorList.push(navigatorPane);
		//selectedNavigatPane.data = dc;
	    this.setOnCompletePrePage(true);
		this.selectChild(selectedNavigatPane);
		this._interestShowNavigator();
		//当点击回退按钮时，没有返回数据，不比调用回调函数。
		(dc && (!dc.target || (dc.target.className !== "backDiv"))) && selectedNavigatPane._onComplete(dc);
		this.setOnCompletePrePage(false);
	},
	
	onCompleteClick : function(title){	
		var navigatorPane = this.navigatorList.pop(),
			selectedNavigatPane = this.navigatorList.pop();
		this.navigatorList.push(selectedNavigatPane);
		this.navigatorList.push(navigatorPane);
		if(selectedNavigatPane._navigatorPaneSubscribe){
			selectedNavigatPane._onComplete = selectedNavigatPane._navigatorPaneSubscribe[title].method;
		}					
	},
	/**
	 * @summary:
	 * 		刷新当前导航页
	 * @example:
	 */
	refresh: function(showXhrLoading){
		//快速连续刷新由于页面没有渲染完可能会导致错误
		if(!this._canRefresh) return;
		unieap.fireEvent(this,this.onBeforeRefresh,[this]);
		var self = this;
		this._canRefresh = false;
		setTimeout(function(){
			self._canRefresh = true;
		},1000);
		var currentTab = this.getSelectedTab(),
		parentContainer = currentTab.getParentContainer();
		//当用iframe方式加载的时候currentTab.getParentContainer()为undefined，因为是iframe方式也就不用做销毁处理了。
		if(parentContainer){
		if(parentContainer.getParentContainer && parentContainer.getParentContainer()){
				unieap.destroyWidgets(currentTab.domNode);
			}else{
				unieap.destroyWidgets(document.body);
			}
		}
		if(currentTab.href){
			//刷新之前首先解除之前页面的发布订阅，否则影响后续逻辑执行以及内存泄露
//			if(parentContainer){
//				var topics = unieap.getTopWin().dojo._topics[parentContainer.id + currentTab.title];
//				if(typeof topics != 'undefined')  topics._listeners = [];
//			}
			dojo.forEach(currentTab.navigatorSubscribe, unieap.getTopWin().dojo.unsubscribe);
			unieap.loader.load( {
				 node : currentTab.domNode,
				 showXhrLoading : !showXhrLoading,
				 url : currentTab.href,
				 _afterPageLoad:this._afterPageLoad
			 });
		}
		//恢复数据
		var data = currentTab.data;
		//用户在刷新以后给页面传递的数据，数据是非DataCenter或者DataStore类型的object
		if(this.onAfterRefresh()){
			data = this.onAfterRefresh();
		}else if(data && data.declaredClass === "unieap.ds.DataCenter"){ //原始传入的是dataCenter
			var stores = data.getDataStores();
			for(store in stores){
				var rowSet = stores[store].getRowSet();
				rowSet && rowSet.discardUpdate();
			}
		}else if(data && data.declaredClass === "unieap.ds.DataStore"){  //原始传入的是dataStroe
			var rowSet = data.getRowSet();
			rowSet && rowSet.discardUpdate();
		}else{
			data = currentTab.origValue;       //原始传入的是普通的数据，如number或者string类型的简单类型数据
		}
		for(var a in currentTab.origparameters){
			data.parameters[a] = currentTab.origparameters[a];
		}
		unieap.destroyDialogAndMenu(currentTab);
		unieap.destroyDialogAndMenu(this.getParentContainer());
	},
	
	//刷新以后给页面传递的数据
	onAfterRefresh: function(){
		return null;
	},
	/**
	 * @summary:
	 * 		得到当前选中的Tab页
	 * @return:
	 * 		{Object} 当前选中的Tab页，如果没有tab页，则返回null
	 * @example:
	 * |var contentPane = unieap.byId("contentpane1");
	 * |unieap.byId("tabContainer").selectChild(contentPane);
	 * |var selectPane = unieap.byId("tabContainer").getSelectedTab();
	 */
	getSelectedTab:function(){
		return this.selectedChildWidget||null;
	},
	
	_transition: function(/*Widget*/newWidget, /*Widget*/oldWidget){
		if(oldWidget){
			this._hideChild(oldWidget);
		}
		this._showChild(newWidget);
	},
	
	_showChild : function(page){
		var children = this.getChildren();
		page.selected = true;

		dojo.removeClass(page.domNode, "unieapHidden");
		dojo.addClass(page.domNode, "unieapVisible");
		
		//在显示后计算
		this.resizeContainer();
		
		if(page._onShow){
			page._onShow(); // trigger load in ContentPane
		}else if(page.onShow){
			page.onShow();
		}
	},
	
	_showMenuNode:function(){
		var topWin = unieap.getTopWin();
		if(topWin.unieap){
			var menuTab = topWin.unieap.byId("framePageContainer");
			if(menuTab.hideTitle){
				var scroll = menuTab.getScroll();
				if(!this._menuNode){
					this._menuNode=dojo.create('div',{'class':'tabward'},this.tablistContainer,'first');
					dojo.addClass(this._menuNode,'fa');
					dojo.addClass(this._menuNode,'fa-bars');
					dojo.addClass(this._menuNode,'eapHiddenMenu');
					dojo.addClass(this.collectMenuNode,'collectMenuDivWithEapMenu');
					this._menuNodeHandle = dojo.connect(this._menuNode,'onclick',scroll,'topMenuward');
				}
			}else{
				dojo.removeClass(this.collectMenuNode,'collectMenuDivWithEapMenu');
				if(this._menuNode){
					dojo.destroy(this._menuNode);
					this._menuNode = null;
				}
				if(this._menuNodeHandle){
					dojo.disconnect(this._menuNodeHandle);
					this._menuNodeHandle = null;
				}
			}
		}
	},
    
	_hideChild: function(/*Widget*/ page){
		page.selected = false;
		dojo.removeClass(page.domNode, "unieapVisible");
		dojo.addClass(page.domNode, "unieapHidden");

		if(page.onHide){
			page.onHide();
		}
	},
	
	closeChild: function(/*Widget*/ page){
		var remove = page.onClose(this, page);
		if(remove){
			this.removeChild(page);
			// makes sure we can clean up executeScripts in ContentPane onUnLoad
			page.destroyRecursive();
		}
	},
	
	//隐藏
	hideTabButton: function(page) {
		if(this._started){
			dojo.publish(this.id+"-hideTabButton", [page]);
			
			this.getScroll().calculateScroll();
			
			//如果被删除节点是当前选中节点，在删除后将TabContainer第一个子节点选中
			if(this.selectedChildWidget === page){
				var children = this.getChildrenNotHidden();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},
	
	//设置Tab页不可编辑
	_disableTabButton: function(page){
		if(this._started){
			dojo.publish(this.id+"-disableTabButton",[page]);
			this.getScroll().calculateScroll();
			//如果被设置不可编辑的节点是当前选中节点，在删除后将TabContainer第一个子节点选中
			if(this.selectedChildWidget === page){
				var children = this.getChildrenEnabled();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},
	
	/**
	 * @summary:
	 * 		设置某个Tab页可编辑
	 * @param: 
	 * 		{string} contentPane ID
	 * @example:
	 * |unieap.byId("tabContainer").enableTabButton(contentpane1);
	 */
	enableTabButton: function(contentPaneId){
		var page = unieap.byId(contentPaneId);
		if(this._started){
			dojo.publish(this.id+"-enableTabButton",[page]);
			this.getScroll().calculateScroll();
		}
	},
	/**
	 * @summary:
	 * 		设置某个Tab按钮编辑状态
	 * @param: 
	 * 		{string} contentPane ID
	 * @param: 
	 * 		{boolean} 是否可编辑
	 * @example:
	 * |unieap.byId("tabContainer").setTabButtonState(contentpane1,false);
	 */
	setTabButtonState:function(contentPaneId,state){
		var page = unieap.byId(contentPaneId);
		if(this._started){
			dojo.publish(this.id+"-setTabButtonState",[page,state]);
			this.getScroll().calculateScroll();
		}
	},
	
	showTabButton: function(page) {
		if(this._started){
			dojo.publish(this.id+"-showTabButton", [page]);
			this.getScroll().calculateScroll();
		}
	},
	
	/**
	 * @summary:
	 * 		动态设置ContentPane在Tab页中的隐藏
	 * @description：
	 * 		如果该Tab正在被选中，隐藏后会自动选中TabContainer中第一个Tab页
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="containerId" style="width:400px;height:400px;">
	 * |	<div id="test1" dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div id="test2" dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	//设置Tab页隐藏
	 * |	function hideTab(){
	 * |		var tabContainer = unieap.byId('containerId');
	 * |		tabContainer.hideTab('test2');
	 * |	}
	 * |</script>
	 */
	hideTab: function(id){
		var contentPane = unieap.byId(id);
		if(contentPane && contentPane._inTabContainer){
			contentPane.hidden = true;
			this.hideTabButton(contentPane);
		}
	},
	/**
	 * @summary:
	 * 		动态设置ContentPane在Tab页中的显示
	 * @param: 
	 * 		{string} Tab容器内的ContentPane Id
	 * 		{boolean} 显示后是否默认选中，默认为false，不选中
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" id="containerId" style="width:400px;height:400px;">
	 * |	<div id="test1" dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div id="test2" dojoType="unieap.layout.ContentPane" title="测试二" hiden="true"></div>
	 * |</div>
	 * |<script>
	 * |	//显示测试二Tab页并选中
	 * |	function showTab(){
	 * |		var tabContainer = unieap.byId('containerId');
	 * |		tabContainer.showTab('test2',true);
	 * |	}
	 * |</script>
	 */
	showTab: function(id,select) {
		var contentPane = unieap.byId(id);
		if(contentPane._inTabContainer){
			contentPane.hidden = false;
			this.showTabButton(contentPane);
			if(select){
				this.selectChild(contentPane);
			}
		}
	},
	
	getChildrenNotHidden: function() {
		var allChildren = this.getChildren();
		var children = [];
		for(var i=0; i<allChildren.length; i++){
			if(allChildren[i].hidden == false) {
				children.push(allChildren[i]);
			}
		}
		return children;
	},
	
	getChildrenEnabled: function(){
		var allChildren = this.getChildren();
		var children = [];
		for(var i = 0; i < allChildren.length; i++){
			if(allChildren[i].enabled){
				children.push(allChildren[i]);
			}
		}
		return children;
	},
	
	_adjacent: function(/*Boolean*/ forward){
		// summary:
		//		Gets the next/previous child widget in this container from the current selection.
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedChildWidget);
		index += forward ? 1 : children.length - 1;
		return children[ index % children.length ]; // dunieap_Widget
	},

	forward: function(){
		// summary:
		//		Advance to next page.
		this.selectChild(this._adjacent(true));
	},

	back: function(){
		// summary:
		//		Go back to previous page.
		this.selectChild(this._adjacent(false));
	},
	
	_getTabWidth : function() {
		var width = 0;
		dojo.forEach(this.tablist.getChildren(), function(p) {
			width += p.getWidth();
		}, this);
		return width;
	},
	
	
	_getTabHeight : function(){
		var height = 0;
		dojo.forEach(this.tablist.getChildren(), function(p) {
			height += p.getHeight();
		}, this);
		return height;				
	},
	
	
    destroy: function(){
		dojo.forEach(this.navigatorSubscribe, unieap.getTopWin().dojo.unsubscribe);
		this.navigatorSubscribe = null;
    	for(var i = 0, l = this.closedNavigatorList.length; i < l; ++i){
			var pane = this.closedNavigatorList.pop();
			pane.destroy();
		}
		
		
        if (this.tablist) {
            this.tablist.destroy();
        }
		if(this.scroll) {
			this.scroll.destory();
		}
		this._beingDestroyed = true;
        this.inherited(arguments);
        while(this.connects.length){
			dojo.disconnect(this.connects.pop());
		}
    }
});

dojo.provide("unieapx.layout.NavigatorController");

dojo.require("unieap.menu.Menu");
dojo.require("unieap.layout.Container");
dojo.require("dijit._Templated");
dojo.declare("unieapx.layout.NavigatorController", [unieap.layout.Container,dijit._Templated], {
	/*
     * @declaredClass:
     * 		unieap.layout.TabController
     * @summary:
     * 		控制Tab页控制类，增加TabButton、控制Tab页切换等
     */

	templateString: "<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress' dojoAttachPoint='containerNode'></div>",

	//tab标签的位置
	//	{"top"|"bottom"|"left-h"|"right-h"}	
	tabPosition: "top",
	
	buttonWidget: "unieapx.layout._NavigatorButton",
	//控制Tab页是否鼠标移动其上，能够自动切换到相应的页
	autoSwitchTab: "false",
	
	//关联的TabContainer
	container: null,
	
	_buttonNo: 0,
	
	postCreate: function(){
		dijit.setWaiRole(this.domNode, "tablist");
		
		if(this.tabPosition == 'left-h' || this.tabPosition == 'right-h') {
			this.domNode.style.height="99999px"
		} else {
			this.domNode.style.width="99999px"
		}

		this.pane2button = {};		// mapping from panes to buttons

		this._subscriptions=[
			dojo.subscribe(this.container.id+"-startup", this, "onStartup"),
			dojo.subscribe(this.container.id+"-addChild", this, "onAddChild"),
			dojo.subscribe(this.container.id+"-removeChild", this, "onRemoveChild"),
			dojo.subscribe(this.container.id+"-selectChild", this, "onSelectChild"),
			dojo.subscribe(this.container.id+"-hideTabButton", this, "hideTabButton"),
			dojo.subscribe(this.container.id+"-showTabButton", this, "showTabButton"),
			dojo.subscribe(this.container.id+"-disableTabButton",this,"disableTabButton"),
			dojo.subscribe(this.container.id+"-enableTabButton",this,"enableTabButton"),
			dojo.subscribe(this.container.id+"-setTabButtonState",this,"setTabButtonState")
		];
	},
	/*
	 * container的addChild方法发布-addChild事件
	 * TabController订阅事件后执行该方法：创建对应的TabButton,绑定相应的事件
	 */
	onAddChild: function(/*Widget*/ page, /*Integer?*/ insertIndex){
		// summary:
		//		Called whenever a page is added to the container.
		//		Create button corresponding to the page.
		// tags:
		//		private

		// add a node that will be promoted to the button widget
		var refNode = dojo.doc.createElement("span");
		this.domNode.appendChild(refNode);
		// create an instance of the button widget
		var cls = dojo.getObject(this.buttonWidget);
		var button = new cls({_buttonNo:this._buttonNo,tablist: this, page:page, autoSwitchTab: this.autoSwitchTab}, refNode);
		this.addChild(button, "last");
		this.pane2button[page] = button;
		this._buttonNo++;
		page.controlButton = button;	// this value might be overwritten if two tabs point to same container

		if(!this._currentChild){ // put the first child into the tab order
			this._currentChild = page;
		}
		//make sure all tabs have the same length
		if(!this.isLeftToRight() && dojo.isIE && this._rectifyRtlTabList){
			this._rectifyRtlTabList();
		}
	},

	_rectifyRtlTabList: function(){
		//summary: Rectify the width of all tabs in rtl, otherwise the tab widths are different in IE
		if(0 >= this.tabPosition.indexOf('-h')){ return; }
		if(!this.pane2button){ return; }

		var maxWidth = 0;
		for(var pane in this.pane2button){
			var ow = this.pane2button[pane].innerDiv.scrollWidth;
			maxWidth = Math.max(maxWidth, ow);
		}
		//unify the length of all the tabs
		for(pane in this.pane2button){
			this.pane2button[pane].innerDiv.style.width = maxWidth + 'px';
		}	
	}, 
	/*
	 * container.startup方法发布-startup事件
	 * TabController订阅事件后执行该方法 
	 * info {children:孩子节点数组，seleted:选中某节点}
	 */
	onStartup: function(/*Object*/ info){
		dojo.forEach(info.children, this.onAddChild, this);
		this.onSelectChild(info.selected);
	},
	
	/*
	 * container.removeChild方法发布-removeChild事件
	 * TabController订阅事件后执行该方法：移除container对应的TabButton
	 */
	onRemoveChild: function(/*Widget*/ page){
		if(this._currentChild === page){ this._currentChild = null; }
		
		var button = this.pane2button[page];
		if(button){
			button.destroy();
			delete this.pane2button[page];
		}
	},
	
	/*
	 * container.selectChild(page)发布-selectChild事件，
	 * TabController订阅事件后执行该方法,处理TabButton的选中状态
	 */
	onSelectChild: function(/*Widget*/ page){
		if(!page){ return; }
		
		if(this._currentChild){
			//原TabButton取消选中状态
			var oldButton=this.pane2button[this._currentChild];
			
			oldButton.setSeleted(false);
		}
		//设置TabButton选中状态
		var newButton=this.pane2button[page];
		newButton.setSeleted(true);
		this._currentChild = page;
		dijit.setWaiState(this.container.containerNode, "labelledby", newButton.id);
		this._handleFocus(newButton);
	},
	//隐藏TabButton
	hideTabButton: function(page) {
		var button = this.pane2button[page];
		button.hide();
	},
	
	//显示TabButton
	showTabButton: function(page) {
		var button = this.pane2button[page];
		button.show();
	},
	
	//设置tab页Button不可编辑，标识本页不是当前页
	disableTabButton: function(page){
		var button = this.pane2button[page];
		button.disabled();
	},
	
	//设置tab页Button能够编辑，标识本页是当前页
	enableTabButton: function(page){
		var button = this.pane2button[page];
		button.enabled();
	},
	
	//设置tab页Button是否能够编辑
	setTabButtonState:function(page,state){
		var button = this.pane2button[page];
		button.setButtonState(state);
	},
	/*
	 * 处理焦点
	 */
	_handleFocus: function(button) {
		unieap.blurWidget();
	},
	
	//选中page
	onButtonClick: function(/*Widget*/ page){
		var flag = unieap.fireEvent(this, this.onBeforeSelectTab, [page]);
		if(false == flag){
			return;
		}
		this.container.selectChild(page); 
	},
	
	//关闭page
	onCloseButtonClick: function(/*Widget*/ page){
		this.container.closeChild(page);
//		var b = this.pane2button[this._currentChild];
//		if(b){
//			dijit.focus(b.focusNode || b.domNode);
//		}
	},
	
	// TODO: this is a bit redundant with forward, back api in StackContainer
	adjacent: function(/*Boolean*/ forward){
		// summary:
		//		Helper for onkeypress to find next/previous button
		// tags:
		//		private

		if(!this.isLeftToRight() && (!this.tabPosition || /top|bottom/.test(this.tabPosition))){ forward = !forward; }
		// find currently focused button in children array
		var children = this.getChildren();
		var current = dojo.indexOf(children, this.pane2button[this._currentChild]);
		// pick next button to focus on
		var offset = forward ? 1 : children.length - 1;
		return children[ (current + offset) % children.length ]; // dijit._Widget
	},

	onkeypress: function(/*Event*/ e){
		// summary:
		//		Handle keystrokes on the page list, for advancing to next/previous button
		//		and closing the current page if the page is closable.
		// tags:
		//		private
		if(this.disabled || e.altKey ){ return; }
		var forward = null;
		if(e.ctrlKey || !e._djpage){
			var k = dojo.keys;
			switch(e.charOrCode){
				case k.LEFT_ARROW:
				case k.UP_ARROW:
					if(!e._djpage){ forward = false; }
					break;
				case k.PAGE_UP:
					if(e.ctrlKey){ forward = false; }
					break;
				case k.RIGHT_ARROW:
				case k.DOWN_ARROW:
					if(!e._djpage){ forward = true; }
					break;
				case k.PAGE_DOWN:
					if(e.ctrlKey){ forward = true; }
					break;
				case k.DELETE:
					if(this._currentChild.closable){
						this.onCloseButtonClick(this._currentChild);
					}
					dojo.stopEvent(e);
					break;
				default:
					if(e.ctrlKey){
						if(e.charOrCode === k.TAB){
							this.adjacent(!e.shiftKey).onClick();
							dojo.stopEvent(e);
						}else if(e.charOrCode == "w"){
							if(this._currentChild.closable){
								this.onCloseButtonClick(this._currentChild);
							}
							dojo.stopEvent(e); // avoid browser tab closing.
						}
					}
			}
			// handle page navigation
			if(forward !== null){
				this.adjacent(forward).onClick();
				dojo.stopEvent(e);
			}
		}
	},
	
	destroy: function(){
		for(var pane in this.pane2button){
			this.onRemoveChild(pane);
		}
		dojo.forEach(this._subscriptions, dojo.unsubscribe);
		this.inherited(arguments);
	}

//	onContainerKeyPress: function(/*Object*/ info){
//		info.e._djpage = info.page;
//		this.onkeypress(info.e);
//	},
});

/*
 * TabButton实现类
 */
dojo.declare("unieapx.layout._NavigatorButton",[dijit._Widget, dijit._Templated],{

	baseClass: "navigator",
	
	tabPosition:"top",
	
	//TabButton关联的container
	container: null,
	
	//标记tab页当前的选中状态
	selected: false,

	//标记tab页是否可关闭，对应CSS样式：tab页按钮上会有'X'
	closable: false,
	
	_buttonNo: null,
	
	templateString: 
					"<a href='javascript:void(0);' tabindex='-1' class='tab u-a-navigator navigator' dojoAttachPoint='focusNode' dojoAttachEvent='onclick:onButtonClick'>"+
						"<div  class='navigatorInnerDiv' dojoAttachPoint='innerDiv'>"+
							"<div class='fa fa-angle-right arrowsImage' dojoAttachPoint='arrowsDiv'></div>"+
							"<span dojoAttachPoint='containerNode' class='tabLabel'></span>"+
							"<span dojoAttachPoint='closeNode' "+
								"dojoAttachEvent='onclick: onClickCloseButton'>"+
							"</span>"+
						"</div>"+
					"</a>",
								
	tabIndex: "-1",

	postCreate: function(){
		if(0 == this._buttonNo) this.arrowsDiv.style.display = "none";
		this.label = this.page.title;
		this.tabPosition = this.tablist.tabPosition;
		this.closable = this.page.closable;
		var aLabelClass = 'u-a-navigator'+this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "");
		dojo.addClass(this.domNode,aLabelClass);
		
		if(this.closable){
			dojo.addClass(this.innerDiv, "unieapClosable");
			dojo.attr(this.closeNode,"title", RIA_I18N.layout.tabController.close);
		}else{
			this.closeNode.style.display="none";
		}
		
		this.inherited(arguments); 

		if(this.label){
			//存在-h需要字体纵向显示
			if(-1 != this.tabPosition.indexOf('-h')&&!dojo.isIE){
				//this.containerNode.innerHTML="<marquee scrollAmount='2'>"+this.label+"</marquee>";
				var labelArray = this.label.split("");
				var e;
				for(var i=0; i<labelArray.length; i++) {
					e = dojo.create('div',null,this.containerNode);
					e.textContent = labelArray[i];
				}
			}else{
				if(dojo.isIE) {
					this.containerNode.innerText = this.label;
				} else {
					this.containerNode.textContent = this.label;
				}
			}
		}
		dojo.setSelectable(this.containerNode, false);
		if(this.autoSwitchTab){
			this._handleSwitch = this.connect(this.focusNode, "mouseover", this.onMouseOver);
		}
	},
	
	setTitle: function(title){
		if(!title) return;
		if(dojo.isIE) {
			this.containerNode.innerText = title;
		} else {
			this.containerNode.textContent = title;
		}
	},
	
	onMouseOver : function(evt){
		this.onButtonClick(evt);
	},
	
	/*
	 * 设置TabButon选中
	 */
	setSeleted: function(/*Boolean*/ bool){
		this.selected = bool;
		var cls=this.baseClass+"Checked";
//		var cls="";
		//设置选中样式
		if(bool) {
			dojo.addClass(this.domNode,cls);
			//ie6下不显示Tab按钮边框
//			dojo.isIE==6&&dojo.style(this.domNode,"height",dojo.style(this.domNode,"height")+2);
		}else {
//			if(dojo.isIE==6&&dojo.hasClass(this.domNode,cls)){
//				dojo.style(this.domNode,"height",dojo.style(this.domNode,"height")-2);
//				dojo.style(this.domNode,'backgroundColor','white')
//			}
			dojo.removeClass(this.domNode,cls);
		}	
	},

	/*
	 * 在TabController onAddChild方法里把onClick方法绑定了onButtonClick
	 */
	onButtonClick: function(/*Event*/ evt){
		if(dojo.attr(this.domNode,'disabled') == 'disabled'){    
	        return false;//阻止点击事件  
	    }     
//		if(dojo.isIE&&this.domNode.setActive){
//			try{
//				this.domNode.setActive();
//			}catch(e){
//				
//			}
//		}
		//调用 TabController 方法里的
		this.tablist.onButtonClick(this.page);
	},
	//当closable=true时，点击'X'触发该方法，方法不应该被覆盖，可以connect
	//Note that you shouldn't override this method, but you can connect to it.
	onClickCloseButton: function(/*Event*/ evt){
		//禁止事件传播
		evt.stopPropagation();
		if(this._handleSwitch){
			this.disconnect(this._handleSwitch);
		}
		this.tablist.onCloseButtonClick(this.page);
	},
	
	//tab页关闭前触发的事件，return true tab页关闭
	onClose: function(){
		return true;		// Boolean
	},
	
	getWidth:function(){
		var size=dojo.marginBox(this.domNode);
		if(dojo.isWebKit){
			//margin;
			return size.w+4;
		}
		return size.w;
	},
	
	getHeight : function(){
		var size=dojo.marginBox(this.domNode);
		return size.h;
	},
	
	hide: function() {
		dojo.style(this.domNode,'display','none');
	},
	
	show: function() {
		dojo.style(this.domNode,'display','inline-block');
	},
	disabled: function(){
		dojo.style(this.domNode,'color','gray');
		dojo.attr(this.domNode,'disabled',"disabled");
	},
	enabled: function(){
		dojo.style(this.domNode,'color','');
		dojo.removeAttr(this.domNode,'disabled');
	},
	setButtonState: function(state){
		if(state){
			dojo.style(this.domNode,'color','');
			dojo.removeAttr(this.domNode,'disabled');
			
		}else{
			dojo.style(this.domNode,'color','gray');
			dojo.attr(this.domNode,'disabled',"disabled");
		}
	}
});
dojo.provide("unieapx.layout.NavigatorPane");
dojo.require("unieap.layout.Container");
dojo.declare("unieapx.layout.NavigatorPane", [unieap.layout.Container], {
	/**
	 * @declaredClass:
	 * 		unieap.layout.ContentPane
	 * @superClass:
	 * 		unieap.layout.Container
	 * @summary:
	 * 		容器类
	 * @classDescription:
	 * 		在TabContainer或StackContainer中使用
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="tab1">ContentPane,这是一个ContentPane!</div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="tab二"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="容器三"></div>
	 * |</div>
	 * 		包含三个ContentPane的TabContainer
	 * @img：
	 * 		images/layout/contentpane.png
	 */
	
	//配置属性接口
	UserInterfaces : dojo.mixin({
		href : "string",
		showLoading : "boolean",
		refreshOnShow : "boolean",
		selected : "boolean",
		closable : "boolean",
		hidden : "boolean",
		title : "string",
		onCompleteByClick : "boolean",
		onClose : "function",
		onShow : "function",
		onInit : "function",
		onHide : "function",
		enabled	: "boolean"
	},
	unieap.layout.Container.prototype.UserInterfaces),
	
	/**
	 * @summary:
	 * 		使用iframe的src路径
	 * @description：
	 * 		当配置href时，会将href链接的内容放入iframe中显示出来。
	 * @type：
	 * 		{string}		
	 */
	href: "",
	
	//用于记录本页面在返回时配置的onComplete信息
	_navigatorPaneSubscribe: null,

	//是否已经初始化内容
	_hasInit:false,
	
	//是否在TabContainer中
	_inTabContainer:false,
	
	/**
	 * @summary:
	 * 		是否显示登录进度条
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		false
	 */
	showLoading:false,
	
	/**
	 * @summary:
	 * 		页面显示时是否需要刷新页面
	 * @type:
	 * 		{boolean}
	 * @default：
	 * 		false
	 */
	refreshOnShow:false,
	
	
	/**
	 * @summary:
	 * 		是否默认选中
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 * @description：
	 * 		当所有的ContentPane都未设置selected时，选中第一个ContentPane。
	 * 		否则选中配置selected的ContentPane。
	 * 		当多个ContentPane都设置selected时，选中第一个配置selected的ContentPane。
	 */
	selected:false,
	
	/**
	 * @summary:
	 * 		设置Tab页在Tab容器中是否可关闭,不适合StackContainer
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 */
	closable:false,
	
	/**
	 * @summary:
	 * 		设置Tab页在Tab容器中是否隐藏
	 * @description:
	 * 		在StackContainer容器中无效
	 * @type：
	 * 		{boolean}
	 * @default：
	 * 		false
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二" hidden="true"></div>
	 * |</div>
	 */
    hidden:false,
	
	
	/**
	 * @summary:
	 * 		设置ContentPane在Tab容器中的显示标签
	 * @type:
	 * 		{string}
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二" hidden="true"></div>
	 * |</div>
	 */
	title:'',
	
	currentTitle: "",
	onCompleteByClick:false,
    
	/*
	 * @summary:
	 * 		装载页面内容的提示语
	 * @type：
	 * 		{string}
	 * @default:
	 * 		"正在装入..."
	 */
	loadingMessage: RIA_I18N.layout.contentPane.loading,
	
	/**
	 * @summary:
	 * 		设置Tab页在Tab容器中是否可编辑
	 * @type:
	 * 		{boolean}
	 * @default:
	 * 		true
	 */
	enabled:true,
	
	
	data: null,
	
	setData: function(data){
		this.data = data;
	},

	getData: function(data){
		return this.data;
	},


	setOnCompleteByClick: function(onCompleteByClick){
		this.onCompleteByClick =onCompleteByClick;
	},
	getOnCompleteByClick: function(){
		return this.onCompleteByClick;
	},
	
	 checkTime : function(i, j)
	{
	   if(j){
	     i = '0000' + i;
	     return i.substr(i.length - 4);
	   }
	   if (i < 10)
	   {
	      i = "0" + i;
	   }
	   return i;
	},
	postCreate : function(){
		this.inherited(arguments);
		this.navigatorSubscribe = [];
		this.origValue = this.data;
		var data = this.data;
		if(data && data.declaredClass === "unieap.ds.DataCenter"){
			this.origparameters = {};
			for(var a in data.parameters){
				this.origparameters[a] = data.parameters[a];
			}
		}
		var time = new Date();
		beginTime = time.getTime();
//		console.log("开始请求“"+ this.title +"”["+unieap.userAccount+" "+ this.checkTime(time.getHours())+":"+this.checkTime(time.getMinutes())+":"+this.checkTime(time.getSeconds())+":"+this.checkTime(time.getMilliseconds(), 1)+"]"+"..."); // MODIFY BY TENGYF
		console.log(RIA_UNIEAPX_I18N.layout.beginRequest + "“"+ this.title +"”["+unieap.userAccount+" "+ this.checkTime(time.getHours())+":"+this.checkTime(time.getMinutes())+":"+this.checkTime(time.getSeconds())+":"+this.checkTime(time.getMilliseconds(), 1)+"]"+"...");
	},
	
//	cloneDC: function(dc){
//		var newDC = new unieap.ds.DataCenter;
//		newDC.parameters = dc.parameters;
////		dojo.forEach(dc.getDataStores(), function(store){
////			debugger;
////			newDC.addDataStore(store.getName(),store);
////		});
//		var stores = dc.getDataStores();
//		for(store in stores){
//			debugger;
//			var name = stores[store].getName();
//			newDC.addDataStore(name,stores[store].clone(name));
//		}
//		return newDC;
//	},
	
	startup: function(){
	   this.inherited(arguments);
	   if(this._started){ return; }
	   //判断父容器类型，如果在tabcontainer中不执行onShow操作
	   var parent = this.getParentContainer();
	   if(!parent || parent.declaredClass != "unieapx.layout.NavigatorContainer"){
	   	 this._onShow();
	   }
	   
		dojo.attr(this.domNode,'title','');
    },
	
	/**
	 * @summary:
	 * 		重新设置容器的显示内容，将会把原有内容清空。
	 * @param 
	 * 		{String|DomNode|Nodelist} data
	 * @example:
	 * |var content = "<div dojoType='unieap.form.Button' label='取消'></div>";
	 * |unieap.byId("container").setContent(content);
	 */
    setContent:function(data){
    	this.href = "";
		this._setContent(data || "");
		this._createSubWidgets();
		unieap.fireContainerResize(this.domNode);
    },
    
	_setContent: function(cont){
		this.destroyDescendants();
		var node = this.containerNode || this.domNode;
		try{
			while(node.firstChild){
				dojo._destroyElement(node.firstChild);
			}
			if(typeof cont == "string"){
				node.innerHTML = cont;
			}else{
				if(cont.nodeType){
					node.appendChild(cont);
				}else{
					dojo.forEach(cont, function(n){
						node.appendChild(n.cloneNode(true));
					});
				}
			}
		}catch(e){
			
		}
	},
	
	_createSubWidgets: function(){
		var rootNode = this.containerNode || this.domNode;
		try{
			dojo.parser.parse(rootNode, true);
		}catch(e){
			
		}
	},
    
//	resizeContainer : function(size){
//		dojo.marginBox(this.domNode, size);
//		var node = this.containerNode||this.domNode,
//			mb = dojo.mixin(dojo.marginBox(node), size||{});
//		var cb = (this._contentBox = dijit.layout.marginBox2contentBox(node, mb));
//		this.resizeChildrenContainer();
//	},
	
	/**
	 * @summary:
	 * 		设置容器的链接地址
	 * @param 
	 * 		{string} href
	 * @example:
	 * |unieap.byId("container").setHref("http://www.google.com");
	 */
	setHref: function(/*String|Uri*/ href){
		this._if = null;
		this.href=href;
		this.refresh();
	},
	
	_createForm:function(params){
		dojo.byId(this.id+"_form")&&dojo.destroy(this.id+"_form");
		var form = dojo.create("form",{
			name : this.id+"_form",
		    method : "post",
		    target:this.id+"_frame" //将返回的页面显示iframe中
		},dojo.body());
		
		for(var key in params){
			var input=dojo.create('input',{
				type:'hidden',
				value:this._formatParams(params[key]),
				name:key
			},form);
		}
		form.action=this.href;

		return form;
	},
	
	_formatParams:function(param){
		if(param&&(param.declaredClass=='unieap.ds.DataCenter'||param.declaredClass=='unieap.ds.DataStore')){
			return param.toJson();
		}else if(dojo.isObject(param)){
			return dojo.toJson(param);
		}
		return param;
	},
	
	/**
	 * @summary:
	 * 		刷新ContentPane中iframe的src
	 * @example:
	 * |unieap.byId("contentPane").refresh();
	 */
	refresh:function(params){
		if(this.href){
			this.onDownloadStart();
			if(dojo.isObject(params)){
				var form=this._createForm(params);
				form.submit();
			}else{
				if(dojo.isIE){
					this._if.src="javascript:false;";
					this._if.src=this.href;
				}else{
					//在火狐下若主页面尚未加载完成，不添加延时的话，子页面的addOnload不会执行
					var self = this;
				    setTimeout(function(){
					  self._if.src=self.href;
				    },1000);
				}
			}
		}
	},
	
	/**
	 * @summary:
	 * 		在Tab容器中,点击关闭按钮的回调方法
	 * @description:
	 * 		当返回false时,不关闭Tab页。
	 * 		当返回true时,关闭Tab页。
	 * 		默认返回true。
	 * 		不适合StackContainer
	 * @return:
	 * 		{boolean}
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onClose="testOnClose" closable="true"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnClose(pane){
	 * |		//自定义逻辑判断
	 * |	}
	 * |</script>
	 *      
	 */
	onClose:function(){
		return true;
	},

	/**
	 * @summary:
	 * 		当内容显示时触发的事件，每次显示的时候均会触发
	 * @param: 
	 * 		{unieap.layout.ContentPane} pane
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onShow="testOnShow"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnShow(pane){
	 * |		alert("showing");
	 * |	}
	 * |</script>
	 */
	onShow:function(pane){
		
	},
	
	/**
	 * @summary:
	 * 		当内容初始化时触发的事件，仅在初始化的时候执行一次
	 * @param: 
	 * 		{unieap.layout.ContentPane} pane
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onInit="testOnInit"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnInit(pane){
	 * |		alert("init the pane");
	 * |	}
	 * |</script>
	 */
	onInit:function(pane){
		
	},
	
	/**
	 * @summary:
	 * 		当页面内容被隐藏时触发的事件
	 * @description:
	 * 		在tabContainer或stackContainer中打开多个页面时，在切换页面时，会回调此方法
	 * @example:
	 * |<div dojoType="unieap.layout.TabContainer" style="width:400px;height:400px;">
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试一" onHide="testOnHide"></div>
	 * |	<div dojoType="unieap.layout.ContentPane" title="测试二"></div>
	 * |</div>
	 * |<script>
	 * |	function testOnHide(pane){
	 * |		alert("hide the pane");
	 * |	}
	 * |</script>
	 */
	onHide:function(){
		
	},
	
	_onComplete : function(dc){
		
	},
	
	_onShow: function(params){
			
		if(this.postponeRender){
			this.postponeRender = false;
			dojo.parser.parse(this.containerNode);
		}
        if (this.refreshOnShow||!this._hasInit) {
			//refreshOnShow为true或第一次载入 时刷新pane
           // this.refresh(params);
        }
		!this._hasInit&&(this._hasInit=true)&&this._onInit();	

		unieap.fireEvent(this,this.onShow,[this]);
	
    },
	
	_onInit:function(){
		this.resizeContainer();
		unieap.fireEvent(this,this.onInit,[this]);
	},
	
	//创建一个iframe，用于加载设置了href属性的页面
	_createIframe:function(){
		var iframe=null;
		//创建一个带name属性的iframe,在ie下需要显示地设置name属性,不能动态修改
		//不然form的target属性无效
	 	if(dojo.isIE<9){
	 		iframe=dojo.create("<iframe class='u-contentpane-iframe' name='"+this.id+"_frame'></iframe>");
	 	}else{
	 		iframe=dojo.create('iframe',{name:this.id+'_frame','class':'u-contentpane-iframe'});
	 	}
		dojo.style(iframe,{width:0,border:0,height:0});
		dojo.place(iframe,this.containerNode||this.domNode);
		return iframe;
	},
		
	//刷新contentpane的的href前的动作
	onDownloadStart: function(){
		//FIXME:
		//    StackContainer嵌套ContentPane时,loading的效果好像有问题
		//	  
		if(this.showLoading){
			this._loadingNode&&dojo.destroy(this._loadingNode);
			this._loadingNode=dojo.create("div",{'class':'loading','innerHTML':this.loadingMessage},
					this.containerNode||this.domNode,'first');
		}
		if(!this._if){
			this._if=this._createIframe();
			this._if.frameBorder="no";
			var self = this;
			this._if.onreadystatechange = this._if.onload = function(evt){
				if (!this.readyState || 
					this.readyState == "loaded" || 
					this.readyState == "complete") {
					self.onDownloadEnd();
				}
			};
			this._if.onactivate = function(evt){
				dojo.stopEvent(evt);
			}
		}
	},
	
	//成功设置href后的动作
	onDownloadEnd: function(){
		this._loadingNode&&dojo.destroy(this._loadingNode);
		dojo.style(this._if,{
			height:"100%",
			width:"100%"
		});
		//firefox下iframe加载只显示一部分

		(dojo.isFF||dojo.isIE>=8)&&this.height=='auto'&&dojo.style(this.domNode,"height","100%");
	},
	destroy : function(){
		if(this._if){
			this._if.onreadystatechange = null;
			this._if.onload = null;
			this._if.onactivate = null;
		}
		this.origValue = this.data = null;
		this.inherited(arguments);
	},
	/**
	 * @summary:
	 * 		获取iframe的window对象
	 * @return:
	 * 		{object}
	 * @example:
	 * |var container = unieap.byId("container");
	 * |var win = container.getContentWindow();
	 * |alert(win);
	 */
	getContentWindow : function(){
		if(this._if){
			return this._if.contentWindow;
		}	
		return window;
	}
});
(global => {
	global['purehtml'] = {
	  bootstrap: () => {
		console.log('purehtml bootstrap');
		return Promise.resolve();
	  },
	  mount: () => {
		console.log('purehtml mount');
		return render($);
	  },
	  unmount: () => {
		console.log('purehtml unmount');
		return Promise.resolve();
	  },
	};
  })(window);
