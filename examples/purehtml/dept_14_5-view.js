/**
 *
 * @author wangyanbo
 * @version 1.0.0
 * @generated
 */
dojo.require("unieap.view.View");
unieap.define("dept_14_5", function () {
    //单位编码
    var compCode = unieap.loginUser.compCode;

    dojo.addOnLoad(function () {

    });

    dojo.declare("_deptReport.dept_14_5.View", unieap.view.View, {



        create: function () {
            if (typeof (_scribeHandles) != "undefined") {
                dojo.mixin(this, {
                    _scribeHandles: _scribeHandles
                });
            }

            dojo.mixin(this, {
                _rootNodeId: (unieap instanceof UnieapDecorate) ? rootId : '',
                dataCenter: dataCenter,
                getDeptC53ListSuccess: getDeptC53ListSuccess,
                getStore: getStore,
                savePrintTemplate: savePrintTemplate,
                lockCell: lockCell,
                deptLevel_onChange: deptLevel_onChange,
                branch_onChange: branch_onChange,
                attrCode_onChange: attrCode_onChange,
                queryBtn_onClick: queryBtn_onClick,
                btnPrint_onClick: btnPrint_onClick,
                printSet_onClick: printSet_onClick,
                printBtn_onClick: printBtn_onClick,
                grid1_rows_onAfterRenderRow: grid1_rows_onAfterRenderRow,
                compCode: compCode
            });

            this.processor = new _deptReport.dept_14_5.Processor(this);

            this.controls = new unieap.view.Controls(this);
            this.form = new unieap.view.Form(this);
            this.grid = new unieap.view.Grid(this);
            this.tree = new unieap.view.Tree(this);
        },

        init: function () {

            if (!dataCenter.getDataStore('deptReportGrid')) {
                var deptReportGrid = new unieap.ds.DataStore('deptReportGrid');
                deptReportGrid.setRowSetName("com.viewhigh.oes.dept.deptbase.entity.DeptReport");

                dataCenter.addDataStore(deptReportGrid);
            }

            if (!dataCenter.getDataStore('deptReport')) {
                var deptReport = new unieap.ds.DataStore('deptReport');
                deptReport.setParameter("_queryDSRowSetName", "com.viewhigh.oes.dept.deptbase.entity.DeptReport");
                deptReport.setParameter("_queryFakeInfo", {
                    'year': 'name',
                    'startMonth': 'name',
                    'endMonth': 'name',
                    'deptLevel': 'name',
                    'dept': 'name'
                });

                dataCenter.addDataStore(deptReport);
            }

            if (!dataCenter.getDataStore('deptReportVo')) {
                var deptReportVo = new unieap.ds.DataStore('deptReportVo');
                deptReportVo.setRowSetName("com.viewhigh.oes.dept.deptbase.vo.DeptReportVo");

                dataCenter.addDataStore(deptReportVo);
            }

            this.page_init();
        },

        page_initEvents: function () {

            this.connect(unieap.byId("deptLevel"), "onChange", this.deptLevel_onChange);

            this.connect(unieap.byId("branch"), "onChange", this.branch_onChange);

            this.connect(unieap.byId("attrCode"), "onChange", this.attrCode_onChange);

            this.connect(unieap.byId("queryBtn"), "onClick", this.queryBtn_onClick);

            this.connect(unieap.byId("btnPrint"), "onClick", this.btnPrint_onClick);

            this.connect(unieap.byId("printSet"), "onClick", this.printSet_onClick);

            this.connect(unieap.byId("printBtn"), "onClick", this.printBtn_onClick);

        },



        page_load: function () {
            this.inherited(arguments);

            var rowset = view.processor.getLastMarkDeptCostPeriod().getSingleDataStore().getRowSet();
            //年度
            var ACCT_YEAR = rowset.getItemValue(0, "ACCT_YEAR", "primary");
            //月份
            var ACCT_MONTH = rowset.getItemValue(0, "ACCT_MONTH", "primary");
            unieap.byId("year").setValue(ACCT_YEAR);
            unieap.byId("startMonth").setValue(ACCT_MONTH);
            unieap.byId("endMonth").setValue(ACCT_MONTH);
            unieap.byId("deptLevel").setValue(0);

            //查询动态列
            /*
var grid = unieap.byId("grid1");
var dc = view.processor.getReprotHeaders5();
grid.addHeaders(dc.getSingleDataStore());
*/

        },
        page_init: function () {
            var dc = view.processor.queryYear();
            var ds = dc.getSingleDataStore();
            dataCenter.addDataStore("year", ds);

            var dc = view.processor.queryDeptLevel('D');
            var ds = dc.getSingleDataStore();
            dataCenter.addDataStore("deptLevel", ds);

            //单位编码，typeCode，attrCode，grpCost，level
            var dcc = view.processor.getSysDeptByDeptRoleLevel(compCode, "D", null, null, null);
            var dss = dcc.getSingleDataStore();
            dataCenter.addDataStore("dept", dss);

            //院区
            var sysBranchs = view.processor.getSysBranchs()
            var sysBranchssc = sysBranchs.getSingleDataStore();
            dataCenter.addDataStore("sysBranch", sysBranchssc);
        }

    });
    /**
     * @description:getDeptC51List方法的成功回调。
     *
     */

    function getDeptC53ListSuccess(dc) {
        debugger;
        view.grid.setDataStore("grid1", dc.getSingleDataStore());
        var rowsCount = unieap.byId("grid1").getRowManager().getRowCount();

        for (var i = 0; i < rowsCount; i++) {
            var inValue = view.grid.getPropertyValue("grid1", "name", i);
            if (inValue.indexOf("合计") !== -1) {
                unieap.byId("grid1").getViewManager().setRowStyles(i, {
                    'color': '#4e92f5',
                    'font-weight': 'bold'
                });
            }
        }
    }
    /**
     * @description:
     *
     * @param: {参数类型} arg0参数描述
     * @return:
     *
     */

    function getStore(obj) {
        var arr = new Array();
        arr.push(obj);
        var conds = new unieap.ds.DataStore();
        conds.setRowSetName("com.viewhigh.oes.dept.deptbase.vo.DeptReportVo");
        var conRowSet = new unieap.ds.RowSet();
        conRowSet.addRows(arr);
        conds.setRowSet(conRowSet);
        return conds;
    }
    /**
     * @description:
     *
     * @param: {参数类型} arg0参数描述
     * @param: {参数类型} arg0参数描述
     * @return:
     *
     */

    function savePrintTemplate() {
        var form = view.form.getDataStore("form1");
        var row = form.getRowSet().getRow(0);

        //如果科室展示为"纵向"时，则打印模板为固定模板
        var templateCode = 'dept_report_005';
        var isDynamic = '0';
        if (row.getItemValue("deptShow") == '1') { //横向时为动态表头
            templateCode = 'dept_report_005_dynamic';
            isDynamic = '1';
        }

        //判断打印模板是否存在，不存在则先创建模板
        var templateDc = view.processor.getTemplateIdByCode(templateCode);
        if (!templateDc || !templateDc.getParameter("result") || isDynamic == '1') {
            var queryMap = {};
            //-----------注意：报表5表头
            var dc = view.processor.getReprotHeaders5Print(form);
            queryMap["tableHeader"] = JSON.stringify(dc.getSingleDataStore().getRowSet().primary);
            queryMap["templateCode"] = templateCode;
            queryMap["isDynamic"] = isDynamic;

            var dc = unieap.requestBo({
                dc: 'deptBase',
                bo: 'PrintBOImpl',
                method: 'savePrintTemplet',
                params: [JSON.stringify(queryMap)]
            });
        }
    }
    /**
     * @description:
     *
     * @param: {参数类型} arg0参数描述
     * @return:
     *
     */

    function lockCell(headers) {
        var layout = unieap.byId("grid1").getManager("LayoutManager");
        var lockedCells = new Array();
        lockedCells.push(0);
        var i = 1;
        headers.getRowSet().forEach(
            function (row) {
                var isLocked = row.getItemValue("fixed"); //是否锁定
                if (isLocked == true || isLocked == 'true') {
                    lockedCells.push(i);
                }
                i++;
            }
        )
        if (lockedCells.length > 0) {
            layout.lockCell(lockedCells, true);
        }
    }

    function deptLevel_onChange(value) {
        //单位编码，typeCode，attrCode，grpCost，level
        //var dc = view.processor.getSysDeptByDeptRoleLevel(compCode,"D",null,null,value);
        var attrCode = null;
        if ("0" == value) {
            attrCode = unieap.byId("attrCode").getValue();
            var attrCodeCombobox = unieap.byId("attrCode");
            attrCodeCombobox.setDisabled(false);
        }
        else {
            var attrCodeCombobox = unieap.byId("attrCode");
            attrCodeCombobox.setDisabled(true);
            attrCodeCombobox.setValue(null);
            attrCodeCombobox.setText(null);
        }
        var branch = unieap.byId("branch").getValue();
        var obj = {
            "compCode": compCode,
            "branchId": branch,
            "deptLevel": value,
            "typeCode": "D",
            "attrCode": attrCode
        }
        var dc = view.processor.getSysDeptByBranch(getStore(obj));
        var ds = dc.getSingleDataStore();
        var deptId = unieap.byId("dept");
        deptId.setValue(null);
        deptId.setText(null);
        var dataProvider = deptId.getDataProvider();
        dataProvider.setDataStore(ds);
    }

    function branch_onChange(value) {
        var attrCode = null;
        var deptLevel = unieap.byId("deptLevel").getValue();
        if ("0" == deptLevel) {
            attrCode = unieap.byId("attrCode").getValue();
        }
        var obj = {
            "compCode": compCode,
            "branchId": value,
            "deptLevel": deptLevel,
            "typeCode": "D",
            "attrCode": attrCode
        }
        var deptDs = view.processor.getSysDeptByBranch(getStore(obj)).getSingleDataStore();
        var deptId = unieap.byId("dept");
        deptId.setValue(null);
        deptId.setText(null);
        var dataProvider = deptId.getDataProvider();
        dataProvider.setDataStore(deptDs);
    }

    function attrCode_onChange(value) {
        var deptLevel = unieap.byId("deptLevel").getValue();
        if ("0" == deptLevel) {
            var branchId = unieap.byId("branch").getValue();
            var obj = {
                "compCode": compCode,
                "branchId": branchId,
                "deptLevel": deptLevel,
                "typeCode": "D",
                "attrCode": value
            }
            var deptDs = view.processor.getSysDeptByBranch(getStore(obj)).getSingleDataStore();
            var deptId = unieap.byId("dept");
            deptId.setValue(null);
            deptId.setText(null);
            var dataProvider = deptId.getDataProvider();
            dataProvider.setDataStore(deptDs);
        }
    }

    function queryBtn_onClick(event) {
        var form = unieap.byId("form1");
        if (form.validate(true)) {
            var deptShow = unieap.byId("deptShow").getValue();
            var grid = unieap.byId("grid1");
            var dc = view.processor.getReprotHeaders5(view.form.getDataStore("form1"));
            grid.addHeaders(dc.getSingleDataStore());
            //判断结束月份>=开始月份
            var startmonth = unieap.byId("startMonth").getValue();
            var endmonth = unieap.byId("endMonth").getValue();
            if (deptShow == '1') {
                unieap.byId("grid1").getManager("LayoutManager").getCell("name").label = '成本类型';
            }
            else {
                unieap.byId("grid1").getManager("LayoutManager").getCell("name").label = '科室名称';
            }
            lockCell(dc.getSingleDataStore());
            unieap.byId("grid1").refresh();
            if (endmonth < startmonth) {
                MessageBox.alert({
                    title: '提示信息',
                    type: 'warn',
                    message: '结束月份不能小于开始月份！'
                });
                return;
            }

            //根据院区查询时，若不选核算科室，则先校验未设置院区的科室
            var branch = unieap.byId("branch").getValue();
            var dept = unieap.byId("dept").getValue();
            if (branch != null && branch != "" && branch != undefined && (dept == null || dept == "" || dept == undefined)) {
                var rst = view.processor.checkNoBranchDept("D").getDataStore("result");
                var len = 0;
                var primary = rst.getRowSet().primary;
                if (primary != null && primary != '' && primary != 'undefined') {
                    len = primary.length;
                }
                if (len > 0) {
                    unieap.byId("xdialog1").dialogData = {
                        "list": rst
                    };
                    unieap.byId("xdialog1").title = "";
                    unieap.byId("xdialog1").show();
                }
                else {
                    view.processor.queryReport(view.form.getDataStore("form1"));
                }
            }
            else {
                view.processor.queryReport(view.form.getDataStore("form1"));
            }
        }

    }

    function btnPrint_onClick(event) {
        debugger
        var form = view.form.getDataStore("form1");
        var row = form.getRowSet().getRow(0);

        //如果科室展示为"纵向"时，则打印模板为固定模板   
        var templateCode = 'dept_report_005';
        var isDynamic = '0';
        if (row.getItemValue("deptShow") == '1') { //横向时为动态表头
            templateCode = 'dept_report_005_dynamic';
            isDynamic = '1';
        }

        var mapp = {};
        mapp["year"] = row.getItemValue("year");
        mapp["startMonth"] = row.getItemValue("startMonth");
        mapp["endMonth"] = row.getItemValue("endMonth");
        mapp["deptLevel"] = row.getItemValue("deptLevel");
        mapp["cbjc"] = row.getItemValue("cbjc");
        mapp["deptShow"] = row.getItemValue("deptShow");
        mapp["templateCode"] = templateCode;
        mapp["isDynamic"] = isDynamic;
        var dept = row.getItemValue("dept");
        var branch = row.getItemValue("branch");
        var attrCode = row.getItemValue("attrCode");
        if (branch) {
            mapp["branch"] = branch;
        }
        if (attrCode) {
            mapp["attrCode"] = attrCode;
        }
        if (dept) {
            mapp["dept"] = dept;
        }

        //保存打印模板
        savePrintTemplate();

        //打印
        unieap.newPrint({
            autoPrint: false,
            boId: 'deptReport_DeptPrint1405BOImpl_bo',
            params: mapp
        });
    }

    function printSet_onClick(event) {
        debugger
        //如果科室展示为"纵向"时，则打印模板为固定模板
        var templateCode = 'dept_report_005';
        if (unieap.byId("deptShow").getValue() == '1') { //横向时为动态表头
            templateCode = 'dept_report_005_dynamic';
        }

        //保存打印模板
        savePrintTemplate();

        var path = unieap.WEB_APP_NAME + "/plugins/printManager/designer/index.html#/print/StandardPrintArea?id=" + templateCode;
        window.open(path, "设计器");
    }

    function printBtn_onClick(event) {
        var data = new Object();
        data["thead_1_1"] = "医院临床服务类科室全成本构成分析表（医疗成本）";
        var gridData = view.grid.getDataStore("grid1");

        var dc = view.processor.queryPrintReprotList5(gridData.getRowSet().toJson(), view.form.getDataStore("form1"));
        var xml = dc.getParameter("result");
        printXmlToCellByXsltFile(xml, unieap.WEB_APP_NAME + "/dept/deptReport/printXsl/dept_14_5.xsl", data, false, false);
    }

    function grid1_rows_onAfterRenderRow(inRowIndex) {
        var inValue = view.grid.getPropertyValue("grid1", "name", inRowIndex);
        if (inValue.indexOf("合计") !== -1) {
            unieap.byId("grid1").getViewManager().setRowStyles(inRowIndex, {
                'color': '#4e92f5',
                'font-weight': 'bold'
            });
        }
    }

    var view = new _deptReport.dept_14_5.View();
    view.init();

    return view;
})