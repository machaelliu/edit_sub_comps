//cookies 操作函数
function setCookie(c_name,value,expiredays)
{
	var exdate=new Date()
	exdate.setDate(exdate.getDate()+expiredays)
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}
function getCookie(c_name)
{
	if (document.cookie.length>0)
	  {
	  c_start=document.cookie.indexOf(c_name + "=")
	  if (c_start!=-1)
		{ 
		c_start=c_start + c_name.length+1 
		c_end=document.cookie.indexOf(";",c_start)
		if (c_end==-1) c_end=document.cookie.length
		return unescape(document.cookie.substring(c_start,c_end))
		} 
	  }
	return "";
}
function checkCookie()
{
	username=getCookie('user');
	if (username!=null && username!=""){
		return "";
	}else{
		location.href = "checkUser.html"
	}	
}
// 发起jsonp请求
function jsonp(j_src)
{
	var forJsonp = document.getElementById("forJsonp");
	if (forJsonp != null) 
	{
		forJsonp.parentNode.removeChild(forJsonp);
	}
	forJsonp = document.createElement("script");
	forJsonp.setAttribute("src",j_src);
	forJsonp.setAttribute("id", "forJsonp");
	document.body.appendChild(forJsonp);
}