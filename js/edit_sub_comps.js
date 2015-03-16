// corp_id 需要从 cookie 中读取
//var corp_id = getCookie("corp_id");
var corp_id = "wxbjbank";

//if ("" == corp_id)
//{
//	alert("corp_id 无效");
//}

// 指向最后一级目录，注意要以 / 结尾，使用时为 "base_url + php文件名"
var base_url = "http://mobile1.map.qq.com/shuttle/";

var sub_comp_proto = {
	id: undefined,
	name: undefined,
}; // end of 'var sub_comp_proto='

// 存储当前页面上显示的分公司
var curr_subs = [];

// 存储需要被删除的公司
var del_subs = [];

var line_num;


function page_display(json) {
	if (json.state_flag != 0)
	{
		alert("后台数据请求错误");
		return;
	}
	else
	{
		$("#submit_button").attr("disabled", "");

		// 无子公司
		if (0 == json.has_sub_comps)
		{
			$("#sub_comps_tab").append("<tr id='no_subs'><td> (无子公司) </td><td>-</td> <td>-</td> \
					<td>-</td>  </tr>");
		} 
		else
		{ // 含有子公司
			for (var i = 0, len = json.sub_comps.length; i < len; ++i)
			{
				var new_sub = Object.create(sub_comp_proto);
				new_sub.id = json.sub_comps[i].sub_comp_id;
				new_sub.name = json.sub_comps[i].sub_comp_name;

				// 请求线路数据
				$.ajax({
					url: base_url + "rtbus.php",
					data: {"qt":"complines", "comp_id": new_sub.id},
					dataType: "json",
					async: false,
					type: "GET",
					success: function(lines)  {
						line_num = lines.linenum;

					},
					error: function() {
							   alert("后台请求线路错误");
							   return;
				   }
				});

				var update_time = json.sub_comps[i].update_time;
				$("#sub_comps_tab").append("<tr><td>" + new_sub.name + "</td><td>" 
						+ line_num + "</td><td>" +  update_time + "</td></td>" + 
						"<td><input type='button' value='删除' class='buttons dels'/>"
						+ "</tr>");

				curr_subs.push(new_sub);
			}	// end of for 

		}	// end of else
	} // end of else
}

$(function(){
	

	// 请求公司列表
	$.ajax({
		url: base_url + "/rtbus.php",
		async: false, // 同步，即要等待请求处理完再继续显示 html 页面
		type: "GET",
		data: {"qt":"comps", "corp_id": corp_id}, // url 中带的参数
		dataType:"json",
		success: page_display, // 函数名字，函数可以带 1 到 3 个参数
		error: function(){
			//alert("后台数据 qt=comps 请求失败");
			//return;
		}
	});
	
	// 事件绑定： 删除行事件，用事件委托
	$("#sub_comps_tab").delegate(".dels", "click", function(){
		$("#submit_button").removeAttr("disabled");

		// 要删除行对应的 tr 对象
		var tr_obj = $(this.parentNode.parentNode);
		var ix = tr_obj.index();
		var del_sub = curr_subs.splice(ix-1, 1)[0];

		// id 为有效值，说明不是后来添加的，而是一开始从数据库中读取的
		if (del_sub.id != undefined)
		{
			del_subs.push(del_sub);
		}
		
		tr_obj.remove();
	});

	// 事件绑定：新增分公司事件
	$("#add_button").click(function() {
		var no_subs_tr = document.getElementById("no_subs");
		if (no_subs_tr)
		{
			$(no_subs_tr).remove();
		}

		$(".buttons").attr("disabled", "");
		$("#sub_comps_tab").append(
			"<tr><td id='td_input'><input type=text id='name_input' placeholder='分公司名称' autofocus/></td>" +
			" <td>0</td> <td>Now</td> <td id='td_btns'><span>" +
			"<input type='button' value='确定' id ='add_ok'/>" + 
			"<input type='button' value='取消' id ='add_cancel'/>" + 
			"</span></td></tr>");
	});

	// 事件绑定：增加公司时，点击确定按钮事件
	$("#sub_comps_tab").delegate("#add_ok", "click", function(){
		
		var sub_name = $("#name_input").val();

		// 检查用户是否输入
		if ("" == sub_name)
		{
			alert("分公司名不能为空");
			return;
		}
		else // 用户输入正确
		{
			var new_sub = Object.create(sub_comp_proto);
			new_sub.name = sub_name;
			curr_subs.push(new_sub);
			$("#td_input").html(sub_name);
			$("#td_input").removeAttr("id");
			$("#td_btns").html("<input type='button' value='删除' class='buttons dels'/>");
			$("#td_btns").removeAttr("id");

			// 使能其他按钮
			$(".buttons").removeAttr("disabled");
		}
	});

	// 事件绑定：增加新公司时，点击取消按钮
	$("#sub_comps_tab").delegate("#add_cancel", "click", function(){
		
		$("tr").has("#td_input").remove();
		
		// 使能其他按钮
		$(".buttons").removeAttr("disabled");
	});

	// 事件绑定：点击提交按钮
	$("#submit_button").click(function ()
	{
		// 从后台数据库删除元素
		var sub_comp_ids = "";
		for (var i = 0, len = del_subs.length; i < len; i++)
		{
			sub_comp_ids += del_subs[i].id + ";";
		}


		if ("" != sub_comp_ids)
		{
			sub_comp_ids = sub_comp_ids.substr(0, sub_comp_ids.length-1);

			$.ajax({
				url: base_url + "del_subs.php",
				async: false, // 同步，即要等待请求处理完再继续显示 html 页面
				type: "POST",

				data: 
				{
					"qt":"del_subs",
					"corp_id":corp_id,
					"sub_comp_ids":sub_comp_ids
				}, 
				dataType:"json",
				success: function() { // 添加成功不执行任何操作

				},
				error: function(){
						   alert("后台数据 qt=del_subs 请求失败");
						   return;
					   }
			});
		}
	
		// 删除操作完成，清空 del_subs
		del_subs = [];
		
		// 从后台增加数据
		var sub_comp_names = "";
		for (var i = 0, len = curr_subs.length; i < len; i++)
		{
			// 如果 id 是 undefined，说明是新增的分公司
			if (curr_subs[i].id == undefined)
			{
				sub_comp_names += curr_subs[i].name + ";";
			}
		}

		if ("" != sub_comp_names)
		{
			sub_comp_names = sub_comp_names.substr(0, sub_comp_names.length-1);
			$.ajax({
				url: base_url + "/add_subs.php",
				async: false, // 同步，即要等待请求处理完再继续显示 html 页面
				type: "POST",

				// url 中带的参数
				data: {
					"qt":"add_subs",
					"corp_id": corp_id,
					"sub_comp_names": sub_comp_names
				}, 

				dataType:"json",
				success: function() { // 添加成功不执行任何操作

				},
				error: function(){
						   alert("后台数据 qt=add_subs 请求失败");
						   return;
					   }
			});

		}
		
		// 清空当前分公司列表
		curr_subs = [];
		
		// 刷新当前页面
		location.reload();
	});	// 提交事件处理完成

});
