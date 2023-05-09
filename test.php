<?php
	include_once("include/db.php");
	include_once("include/common.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>订单</title>
<link href="Style/Style.css" rel="stylesheet" type="text/css" />
</head>
<body>
<?php
$c = $_GET["c"];
if($c=='amply')$c='ample';

switch($c){
	case '':
		browse();
		break;
	case "append":				//添加订单
	case "remove":				//删除订单
	case "ample":				//订单详细页
	case "amend":				//修改订单
	case "first_order":			//首位订购客服列表
	case "term":				//客服订单筛选
	case "first_order_term":	//首位订购客服订单筛选
	case "search":				//处理筛选条件
	case "first_order_search":  //处理首位订购客服筛选条件
	case "relate":				//关联附属订单

	case "browse_order_channel"://订购渠道列表
	case "append_order_channel"://添加订购渠道
	case "amend_order_channel":	//修改订购渠道
	case "remove_order_channel"://删除订购渠道

	case "wait":				//待发货列表
	case "wait_search":			//待发货查询
	case 'browse_batch_send_list'://批量发货订单列表
	case 'remove_batch_order':	//从批量发货列表中移除
	case "back":				//待退货列表
	case "complete":			//发货部订单列表
	case "search_send_term":	//筛选已发货订单
	case "search_send":			//筛选条件处理
	case "goods":				//货到付款订单
	case "money":				//款到发货订单
	case "search_finance":		//财务订单筛选
	case "finance":				//处理到款的订单
	case "batch":				//财务批量处理订单
	case "send":				//处理发货
	case "receipt":				//确认收到退货
	case "cancel":				//处理退货
	case "express":				//修改发货信息
	case "history":				//发货记录
	case "history_term":		//筛选发货记录
	case "history_search":		//处理筛选条件
	case "search_not_dispose":	//财务筛选未处理订单
	case "finance_search_term":	//财务订单筛选
	case "finance_search":		//处理筛选条件
	case "count_sell_term":		//产品销售统计器
	case "count_sell":			//处理统计条件
	case "order_count_term":	//发货订单统计器
	case "information":	//查看他人的订单订购信息
	case "fact_sign_product":	//产品销售统计报表
	case "amend_order_flow":	//回滚订单流程

	//2010.10.12 添加发货部处理退货功能,处理完毕后跳过等待收到退货状态直接到已经退货状态。
	case "dispose_return":
	case 'set_return_stock':
	case 'active_tag_append':
	case 'active_tag_amply':
	case 'active_tag_amend':
	case 'active_tag_remove':

	case 'import':

	case 'guest_order_counts':
	
 //2022/03/19 添加待确认订金逻辑 订单订金确认后在变为待发货
    case 'reserve_money'://待确认订金订单列表
    case 'reserve_money_finance'://确认收到定金

		$c();
		break;
}

function browse(){
	check_user(43);
	global $db;
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function remove(url){
    <?php
    //如果有删除权限
    if(check_function(47)){
    ?>
    var inputList = document.forms[0].getElementsByTagName('input');
    var sentCount = 0;

    for(var i=0;i<inputList.length;i++){
        if(inputList[i].type=='checkbox'){
            if(inputList[i].checked){
                if(inputList[i].parentNode.getElementsByTagName('span')[0].innerHTML=='1'){
                    <?php if(check_function(182)){?>inputList[i].parentNode.parentNode.style.background='#fcc';<?php }?>
                    sentCount++;
                }
            }
        }
    }

    if(sentCount){
    <?php
        //如果有删除已发货订单的权限
        if(check_function(182)){
    ?>
		var message = '严重 警告！！！！！请认真阅读下面的说明并按提示谨慎操作！\n\n\n删除订单将自动返还系统内的库存，您所选择的所有待操作的订单中至少包含一个【发货中】或【已发货】的订单，并已用红色标注，这需要您核实一下该订单的货物是不是可追回的！\n\n1.如果是可追回的(快递还没取走)，那么如果您确定要删除这些的话，您可以点确定按钮删除这些订单，然后把退回的货物放回仓库！\n2.如果是不可追回的(快递已经取走)，由于没有办法将货物立即退回仓库，所以请不要点击确定按钮，请不要删除订单，以免造成库存混乱，这种情况的订单，请走退货流程，等待收到退货！';
        if(window.confirm(message)){
            command(url);
        }
    <?php
        //否则没有删除已发货的权限
        }else{
    ?>
        alert('<?php echo get_alert_message(182)?>');
    <?php
        }
    ?>
    }else{
        if(window.confirm('确定要删除这些订单吗？')){
            command(url);
        }
    }
    <?php
    }else{
    ?>
    alert('<?php echo get_alert_message(47)?>');
    <?php
    }
    ?>
}

function showExpress(orderID){
	var express = $('express_'+orderID);
	if(!express)return;
	var td = express.parentNode.parentNode;
	express.style.display = '';
	express.style.margin = (td.clientHeight/2)+'px -'+((express.clientWidth-td.clientWidth)/2)+'px 0 0';
}

function hideExpress(orderID){
	var express = $('express_'+orderID);
	if(!express)return;
	var td = express.parentNode.parentNode;
	express.style.display = 'none';
}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">客服订单列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="list_table">
  <tr bgcolor="#f3f3f3">
    <td width="3%" height="30" align="center"><strong>序列</strong></td>
    <td width="7%" align="center"><strong>订单编号</strong></td>
    <td width="10%" align="center"><strong>产品列表</strong></td>
    <td width="3%" align="center"><strong>疗程</strong></td>
    <td width="8%" align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
    <td width="4%" align="center"><strong>客服</strong></td>
    <td width="7%" align="center"><strong>客户姓名</strong></td>
    <td width="7%" align="center"><strong>联系方式</strong></td>
    <td width="7%" align="center"><strong>资源添加时间</strong></td>
    <td width="13%" align="center"><strong>快递信息</strong></td>
    <td width="12%" align="center"><strong>订单状态</strong></td>
    <td width="7%" align="center"><strong>订购渠道</strong></td>
    <td width="6%" align="center"><strong>关联关系</strong></td>
    <td width="6%" align="center"><strong>所属微信</strong></td>
    <td width="4%" align="center"><strong>选择</strong></td>
  </tr>
<?php
	include_once("include/page.php");
	$sql = "select o.id,o.order_code,o.order_name,o.product_id,o.product_name,o.order_money,o.reserve_money,o.pay_money,o.guest_id,o.guest_name,o.guest_contact,o.order_type_code,o.order_type_name,o.order_state_code,o.order_state_name,o.is_valid,o.product_package_count,o.is_sent,o.is_finished,o.express_name,o.express_order_code,o.order_channel_name,o.addition_id,o.addition_name,o.parent,o.assign_express_name,o.express_id,o.express_status,o.resources_add_day,w.no from orderform as o LEFT JOIN wechat w ON o.wechat_id = w.id";
	$where_array = array();
	$t = $_GET['t'];
	if($t=='search'){
		$where = $_SESSION['w'];
		if(!empty($where))array_push($where_array,encode($where,false));
		$param_list .= "t=search";
	}else{
		$where = $_GET['w'];
		if(!empty($where)){
			array_push($where_array,encode($where,false));
			$param_list .= "w=".$where;
		}
		unset($_SESSION['w']);
	}

	/*
	if(empty($where)){
		$is_relate = true;
		array_push($where_array,'parent=0');
	}else{
		$is_relate = false;
	}
	*/
	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){
		$db=new db(true);

		$user_team_id_array=array_strip($_SESSION['user_team']);

		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

        if($product_list){
            array_push($where_array,"product_id in (".$product_list.")");
        }else{
            array_push($where_array,"product_id=0");
        }

		$team_user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

        $uid_list=implode(',',array_strip($team_user_array));

        if($uid_list){
            array_push($where_array,"addition_id in (".$uid_list.")");
        }else{
            array_push($where_array,"addition_id=0");
        }

	}







	if(!check_function(44) and $_GET['t']!='search'){
		array_push($where_array,"addition_id=".$_SESSION["user_id"]);
	}
	if($_GET['t']!='search'){
        $organ_where = get_check_organ_sql(171,'organ_id','');
	}
	if(!empty($organ_where)){
		array_push($where_array,$organ_where);
	}




	if(count($where_array)){
		$where = ' where ' . implode(' and ' ,$where_array);
		$sql .= $where;
		$_SESSION['order_list_where'] = $where;
	}

	$sql .= " order by id desc";

	$page = new page($sql,$param_list);
	$param_list = "offset=".$page->get_offset().$param_list;
	$page_result = $page -> get_result(false);

	include 'include/express.config.php';

	foreach($page_result as $key => $row){

	//$gift[1],$row['guest_name'],
?>
  <tr bgcolor="#ffffff"<?php
  if($row['is_valid']==0)echo " class=\"deleted\""?>>
	<td align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center" height="30"><a href="order.php?c=amply&order_id=<?php echo $row['id']?>"><?php echo $row['order_code']?></a></td>
	<td align="center">
	<?php
		$gift_list = $page->db->query("select product_id,product_name from gift where gift_type=1 and order_id=".$row['id']);
		foreach($gift_list as $gift){
	?>
	 <div style="line-height:20px"> <a href=product.php?c=amply&product_id=<?php echo $gift[0]?>><?php echo $gift[1] ?></a></div>
	<?php
		}
	?>
	</td>

	<td align="center"><?php echo $row['product_package_count']?></td>

	<?php if($_SESSION['organ_name']!='极米' || check_function(225) || $row['addition_id']==$_SESSION['user_id']){ ?>
            <td align="center"><?php
                if($row['order_type_code'] == 0){
                    echo  (round($row['order_money'],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($row['reserve_money'],1)).'</span>+<span style="color:red">'.(round($row['pay_money'],1)).'</span>)</span>');
                }else{
                    echo round($row['order_money'],1);
                }?></td>
    <?php    }else{  ?>
             <td align="center">
                <?php if($row['order_type_code'] == 0){
                    echo  '***<br/><span style="color:#ccc">(<span style="color:#0099FF">***</span>+<span style="color:red">'.(round($row['pay_money'],1)).'</span>)</span>';
                    }else{
                    echo '***';
                    }
                ?>
            </td>
      <?php    }   ?>




	<td align="center"><a href="user.php?c=amply&user_id=<?php echo $row['addition_id']?>"><?php echo $row['addition_name']?></a></td>
	<td align="center"><a href=guest.php?c=amply&guest_id=<?php echo $row["guest_id"]?>><?php echo $row["guest_name"] ?></a></td>
	<?php   if(check_function(216) || $_SESSION['organ_name']=='售后客服部' || $row['addition_id']==$_SESSION['user_id']  ||  $_SESSION['group_id']!=1){ ?>
	<td align="center"><?php echo $row['guest_contact'] ?></td>
	 <?php }else{  ?>
	<td align="center"><?php echo str_repeat('*',mb_strlen($row['guest_contact'],'utf-8'))?></td>
	<?php
		}
	?>
    <td align="center"><?php echo $row['resources_add_day'] ? date('Y-m-d',$row['resources_add_day']) : ''?></td>
	<td onmouseover="showExpress(<?php echo $row['id']?>)" onmouseout="hideExpress(<?php echo $row['id']?>)">
		<div style="position:relative">
			<div align="center"><?php
				/*
				if($row['express_order_code']){
					$express_log = $page->db->query('select express_data,last_update_time,express_status from express_logs where express_code=\''.$row['express_order_code'].'\'',true,'assoc');
					$express_logs_array = (array)json_decode($express_log['express_data']);
					$express_status = $express_log['express_status'];
				}
				*/
				if($row['express_name']){
					if(strpos($row['express_name'],'-')!==FALSE)$row['express_name']=current(explode('-',$row['express_name']));
					echo $row['express_name'].'：'.$row['express_order_code'];
					$express_status = $row['express_status'];
					if(is_numeric($express_status)){
						echo '<span style="color:#'.$express_status_pointer[$express_status]['color'].';margin-left:5px">['.$express_status_pointer[$express_status]['name'].']</span>';
					}
				}else{
					if($row['assign_express_name'])echo '<span style="color:#ccc">'.$row['assign_express_name'].'</span>';
				}
			?></div>
			<?php

				//设置为空，暂不显示了
				$express_logs_array = array();

				if(count($express_logs_array)){
			?>
				<div style="position:absolute;z-index:1;right:0;top:0;border:1px solid #999;background:#fff;height:46px;overflow:hidden;white-space:nowrap;display:none" id="express_<?php echo $row['id']?>">
					<table width="100%" border="0" cellpadding="0" cellspacing="1">
			<?php
						if(count($express_logs_array)>2){
							$express_logs_array = array_slice($express_logs_array,count($express_logs_array)-2,2);
						}
						foreach($express_logs_array as $log){
							echo '
								<tr>
									<td style="padding:5px 0 0 5px" align="left">'.$log->time.'</td>
									<td style="padding:5px 5px 0 5px" align="left">'.$log->context.'</td>
								</tr>
							';
						}
			?>
					</table>
				</div>
			<?php
				}
			?>
		</div>
	</td>
	<td align="center"><?php
		echo $row['order_state_name'];
	?></td>
	<td align="center">
		<?php echo $row['order_channel_name']?>
	</td>
	<td align="center">
		<?php echo $row['parent']?'<span style="color:#ccc">附属订单</span>':'主订单'?>
	</td>
      <td align="center">
          <?php echo $row['no'];?>
      </td>
    <td align="center"><span style="display:none;"><?php echo ($row['is_sent']||$row['order_state_code']==400)?'1':'0'?></span><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row['id']?>" onclick="if(!this.checked)this.parentNode.parentNode.style.background='#fff'"<?php if($row['is_valid']==0)echo' disabled="disabled"'?> /></td>
  </tr>
<?php
	}
?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="13" align="center"><?php $page->show_guide()?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="13" align="center">
		<input name="button" type="button" onclick="command('?c=amend&<?php echo $param_list?>')" value=" 修 改 " />　
		<input name="button" type="button" onclick="window.remove('?c=remove&<?php echo $param_list?>')" value=" 删 除 " />　
		<input name="button" type="button" onclick="command('?c=relate&<?php echo $param_list?>')" value=" 关联附属订单 " />　
		<input name="button" type="button" onclick="selectCheck('reverse')" value=" 反 选 " />　
		<input name="button" type="button" onclick="selectCheck('all')" value=" 全 选 " />
		<?php
			if($_SESSION['is_super'] || (get_organ_info('name')=='龙凰' && in_array($_SESSION["user_name"],array('蒋文龙','阎强','赵静')))){
		?>
		<span style="display:none1">
		　<select id="output_command">
			<option value="">选择一种报表将全部结果导出</option>
			<option value="order_info">订单信息报表</option>
			<option value="guest_info">客户信息资料报表(无重复)</option>
		  </select>
		  <input type="button" id="output_button" value=" 导 出 " onclick="if($('output_command').value!='')window.open('excel.php?c='+$('output_command').value+'<?php echo $w?>')" />
		</span>
		<?php
			}
		?>
	</td>
  </tr>
</table>
</form>

<div style="margin-top:20px;text-align:left">什么是关联关系、主订单和附属订单？</div>
<div style="margin-top:10px;color:#999;text-align:left;line-height:20px">
	订单分为主订单和附属订单两种，主订单和附属订单之间存在一种关联关系，如果一个客服购买了多种产品，那么我们可以为每种产品分别添加独立的订单，然后把他们关联起来，这样系统既可以正常统计销售，也可以将这些订单的所有货物打包在一起发货。
</div>


	</td>
  </tr>
</table>
<?php
}

function search(){
	check_user();
	$is_order_code = $_POST["is_order_code"];
	$is_order_name = $_POST["is_order_name"];
	$is_product = $_POST["is_product"];
	$is_product_package_count = $_POST["is_product_package_count"];
	$is_guest_name = $_POST["is_guest_name"];
	$is_guest_region = $_POST["is_guest_region"];
	$is_guest_address = $_POST["is_guest_address"];
	$is_guest_postcode = $_POST["is_guest_postcode"];
	$is_contact = $_POST["is_contact"];
	$is_order_type_code = $_POST["is_order_type_code"];
	$is_order_channel_id = $_POST['is_order_channel_id'];
	$is_order_state_code = $_POST["is_order_state_code"];
	$is_express_order_code = $_POST["is_express_order_code"];
	$is_add_person = $_POST["is_add_person"];
	$is_money_person = $_POST["is_money_person"];
	$is_send_person = $_POST["is_send_person"];
	$is_express_id = $_POST["is_express_id"];
	$is_date = $_POST["is_date"];
	$is_express_status = $_POST["is_express_status"];
	$is_organ = $_POST['is_organ'];
	$is_order_delete_state = $_POST["is_order_delete_state"];
	$where_array = array();
	if($is_order_code){
		array_push($where_array,"order_code='".$_POST["order_code"]."'");
	}
	if($is_order_name){
		array_push($where_array,"order_name='".$_POST["order_name"]."'");
	}
	if($is_product){
		/*
		$db = new db(true,true);
		$product_id = $_POST["product_id"];
		$order_list = $db -> query("select order_id from gift where product_id=".$product_id);
		$order_array = array();
		foreach($order_list as $order_item){
			$order_array[$order_item[0]] = $order_item[0];
		}
		if(count($order_array)>0){
			array_push($where_array,"id in(".implode(",",$order_array).")");
		}
		*/

		$product_id = $_POST['product_id'];
		$product_class_id = $_POST['product_class_id'];
		if(!is_numeric($product_id)){
			$db = new db(true,true);
			$product_id_array = array_strip($db->query('select id from product where is_valid=1 and class_id='.$product_class_id,'row'));
			if(count($product_id_array)){
				array_push($where_array,'product_id in('.implode(',',$product_id_array).')');
			}else{
				array_push($where_array,'product_id=0');
			}
		}else{
			array_push($where_array,'product_id='.$product_id);
		}

	}
	if($is_product_package_count){
		array_push($where_array,"product_package_count=".$_POST["product_package_count"]);
	}
	if($is_guest_name){
		array_push($where_array,"guest_name='".$_POST["guest_name"]."'");
	}
	if($is_guest_region){
		$sheng_code = $_POST["sheng"];
		$shi_code = $_POST["shi"];
		$xian_code = $_POST["xian"];

		/*
		if(empty($xian_code)){
			if(!empty($shi_code)){
				$region_string = "guest_region_code like'".$sheng_code.",".$shi_code.",%'";
			}else{
				if(!empty($sheng_code)){
					$region_string = "guest_region_code like'".$sheng_code.",%'";
				//}else{
				//	$region_string = "guest_region_code=''";
				}
			}
		}else{
			$region_string = "guest_region_code='".$sheng_code.",".$shi_code.",".$xian_code."'";
		}
		array_push($where_array,$region_string);
		*/

		if(!empty($sheng_code)){
			array_push($where_array,"guest_region_province_code='".$sheng_code."'");
		}
		if(!empty($shi_code)){
			array_push($where_array,"guest_region_city_code='".$shi_code."'");
		}
		if(!empty($xian_code)){
			array_push($where_array,"guest_region_district_code='".$xian_code."'");
		}

	}
	if($is_guest_address){
		array_push($where_array,"guest_address='".$_POST["guest_address"]."'");
	}
	if($is_guest_postcode){
		array_push($where_array,"guest_postcode=".$_POST["guest_postcode"]);
	}
	if($is_contact){
		$contact_type = $_POST["contact_type"];
		$contact_value = $_POST["contact_value"];
		foreach($contact_value as $key => $value){
			if($value!=""){
				array_push($where_array,"guest_contact like'%".$contact_type[$key]."：".$value."%'");
			}
		}
	}
	if($is_order_type_code){
		array_push($where_array,"order_type_code=".$_POST["order_type_code"]);
	}
	if($is_order_channel_id){
		array_push($where_array,"order_channel_id=".$_POST["order_channel_id"]);
	}
	if($is_order_state_code){
		array_push($where_array,"order_state_code=".$_POST["order_state_code"]);
	}
	if($is_express_order_code){
		array_push($where_array,"express_order_code='".$_POST["express_order_code"]."'");
	}
	if($is_add_person){
		array_push($where_array,"addition_id=".$_POST["add_person"]);
	}
	if($is_money_person){
		array_push($where_array,"money_manager_id=".$_POST["money_person"]);
	}
	if($is_send_person){
		array_push($where_array,"sender_id=".$_POST["send_person"]);
	}
	if($is_express_id){
		$express_id = $_POST["express_id"];
		if($express_id=="all"){
			array_push($where_array,"express_id>0");
		}else{
			array_push($where_array,"express_id=".$express_id);
		}
	}
	if($is_date){
		$begin_date = $_POST["begin_date"];
		$begin_hour = $_POST['begin_hour'];
		$begin_minute = $_POST['begin_minute'];
		$end_date = $_POST["end_date"];
		$end_hour = $_POST['end_hour'];
		$end_minute = $_POST['end_minute'];
		if(!empty($begin_hour)){
			if(empty($begin_minute)){
				$begin_minute = 0;
			}
			$begin_date .= " $begin_hour:$begin_minute:0";
		}
		if(!empty($end_hour)){
			if(empty($end_minute)){
				$end_minute = 59;
			}
		}else{
			$end_hour = 23;
			$end_minute = 59;
		}
		$end_date .= " $end_hour:$end_minute:59";
		array_push($where_array,"add_time>='$begin_date'");
		array_push($where_array,"add_time<='$end_date'");
	}
	if($is_express_status){
		array_push($where_array,"express_status=".$_POST["express_status"]);
	}

	if($is_organ){
		array_push($where_array,"organ_id=".$_POST["organ"]);
	}

	if($is_order_delete_state){
		array_push($where_array,"is_valid=".$_POST["order_delete_state"]);
	}

	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0 && !$is_product){
		$db=new db(true,true);


		$user_team_id_array=array_strip($_SESSION['user_team']);
		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

	}

	if($product_list){
		array_push($where_array,"product_id in (".$product_list.")");
	}


	$where = implode(" and ",$where_array);
	if($where==""){
		include_once("include/guide.php");
		$guide = new guide();
		$guide -> set_message("对不起，筛选条件为空或没有找到相关记录！",true);
		$guide -> append("继续筛选","?c=term");
		$guide -> append("订单列表","order.php");
		$guide -> out();
	}
	//append_log("2","客服订单筛选器",$where);
	//header("location:?w=".encode($where));
	$_SESSION['w'] = encode($where);
	header('location:?t=search');
}

function first_order($where=NULL,$is_addition=0,$is_order_channel=0){
	check_user(208);
	global $db;
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function remove(url){

    <?php
    //如果有删除权限
    if(check_function(47)){
    ?>
    var inputList = document.forms[0].getElementsByTagName('input');
    var sentCount = 0;

    for(var i=0;i<inputList.length;i++){
        if(inputList[i].type=='checkbox'){
            if(inputList[i].checked){
                if(inputList[i].parentNode.getElementsByTagName('span')[0].innerHTML=='1'){
                    <?php if(check_function(182)){?>inputList[i].parentNode.parentNode.style.background='#fcc';<?php }?>
                    sentCount++;
                }
            }
        }
    }

    if(sentCount){
    <?php
        //如果有删除已发货订单的权限
        if(check_function(182)){
    ?>
		var message = '严重 警告！！！！！请认真阅读下面的说明并按提示谨慎操作！\n\n\n删除订单将自动返还系统内的库存，您所选择的所有待操作的订单中至少包含一个【发货中】或【已发货】的订单，并已用红色标注，这需要您核实一下该订单的货物是不是可追回的！\n\n1.如果是可追回的(快递还没取走)，那么如果您确定要删除这些的话，您可以点确定按钮删除这些订单，然后把退回的货物放回仓库！\n2.如果是不可追回的(快递已经取走)，由于没有办法将货物立即退回仓库，所以请不要点击确定按钮，请不要删除订单，以免造成库存混乱，这种情况的订单，请走退货流程，等待收到退货！';
        if(window.confirm(message)){
            command(url);
        }
    <?php
        //否则没有删除已发货的权限
        }else{
    ?>
        alert('<?php echo get_alert_message(182)?>');
    <?php
        }
    ?>
    }else{
        if(window.confirm('确定要删除这些订单吗？')){
            command(url);
        }
    }
    <?php
    }else{
    ?>
    alert('<?php echo get_alert_message(47)?>');
    <?php


    }
    ?>
}

function showExpress(orderID){
	var express = $('express_'+orderID);
	if(!express)return;
	var td = express.parentNode.parentNode;
	express.style.display = '';
	express.style.margin = (td.clientHeight/2)+'px -'+((express.clientWidth-td.clientWidth)/2)+'px 0 0';
}

function hideExpress(orderID){
	var express = $('express_'+orderID);
	if(!express)return;
	var td = express.parentNode.parentNode;
	express.style.display = 'none';
}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">客服订单列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="list_table">
  <tr bgcolor="#f3f3f3">
    <td width="4%" height="30" align="center"><strong>序列</strong></td>
    <td width="7%" align="center"><strong>订单编号</strong></td>
    <td width="7%" align="center"><strong>产品列表</strong></td>
    <td width="7%" align="center"><strong>订单疗程</strong></td>
    <td width="8%" align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
    <td width="7%" align="center"><strong>回访客服</strong></td>
    <td width="7%" align="center"><strong>订购客服</strong></td>
    <td width="7%" align="center"><strong>客户姓名</strong></td>
    <td width="7%" align="center"><strong>联系方式</strong></td>
    <td width="18%" align="center"><strong>快递信息</strong></td>
    <td width="12%" align="center"><strong>订单状态</strong></td>
    <td width="7%" align="center"><strong>订购渠道</strong></td>
    <td width="6%" align="center"><strong>关联关系</strong></td>
    <td width="4%" align="center"><strong>选择</strong></td>
  </tr>
<?php
	include_once("include/page.php");
	$sql = "select id,order_code,order_name,product_id,product_name,order_money,guest_id,guest_name,guest_contact,order_type_code,order_type_name,order_state_code,order_state_name,is_valid,product_package_count,is_sent,is_finished,express_name,express_order_code,order_channel_name,addition_id,addition_name,parent,assign_express_name,express_id,express_status,reserve_money,pay_money from orderform as o";

	$where_str="";

	$order_kefu_array=array();

	$product_guest_id_array=array();

	if(!empty($_GET['w'])){
		$where.=$_GET['w'];
	}


	if(empty($where)){
		if(empty($_GET['t'])){
			unset($_SESSION["w"]);
		}else{
			$where = $_SESSION["w"];
			$type_where = '&t=search';
		}
	}else{
		$_SESSION["w"] = $where;
		$_SESSION["is"]=$is_addition;
		$_SESSION["or"]=$is_order_channel;
		$type_where = '&t=search';
	}
	if($is_addition == 1 || $_SESSION["is"]==1){

		$where_temp=preg_replace('/order_channel_id=[\d]+[\s+]and/','',encode($where,false));

		//$where_temp=preg_replace('/and send_time>=\'.*\'[\s+]and[\s+]send_time<=\'.*\'/','',$where_temp);

		//$where_temp=preg_replace('/and add_time>=\'.*\'[\s+]and[\s+]add_time<=\'.*\'/','',$where_temp);


		$sql_pg="select id,product_id,guest_id,addition_id from orderform".$where_temp." and ".get_check_organ_sql(171,'organ_id','');

		if(!check_function(44)){
			$sql_pg.=" and addition_id=".$_SESSION["user_id"];
		}


		$product_guest_array=$db->query($sql_pg);

		foreach($product_guest_array as $p_g_val){
           $g_id_arr=array();

           $is_id=$db->query("select id,guest_id,addition_id from orderform where guest_id=".$p_g_val[2]." and product_id=".$p_g_val[1]." and id<".$p_g_val[0]);

           $is_gt_id=$db->query("select id from orderform where guest_id=".$p_g_val[2]." and product_id=".$p_g_val[1]);

           foreach($is_gt_id as $g_id){
                $g_id_arr[]=$g_id[0];
           }

            $is_gt_str=implode(',',$g_id_arr);

            if(count($is_id)>0 && $p_g_val['addition_id'] != $is_id[0]['addition_id']){

                $product_guest_id_array[]='(guest_id='.$p_g_val[2].' and product_id='.$p_g_val[1].' and id not in ('.$is_gt_str.'))';

            }else{

                $product_guest_id_array[]='(guest_id='.$p_g_val[2].' and product_id='.$p_g_val[1].' and id>='.$p_g_val[0].')';
            }
		}

		$product_guest_id_str=implode(' OR ',$product_guest_id_array);


	}


	if(!empty($where)){
		if(($is_order_channel == 1 || $_SESSION["or"]==1) && ($is_addition == 1 || $_SESSION["is"]==1)){
			//$where_order_temp=encode($where,false);
			$where_order_temp=preg_replace('/addition_id=[\d]+[\s+]and/','',encode($where,false));
		}else{
            if($is_addition == 1 || $_SESSION["is"]==1){
                $where_order_temp=preg_replace('/addition_id=[\d]+[\s+]and/','',encode($where,false));
            }else{
                $where_order_temp=encode($where,false);
            }
		}
		$where_str .= $where_order_temp;
		//$param_list .= "&".$where;
	}


	/*

	if(empty($where)){
		$is_relate = true;
		array_push($where_array,'parent=0');
	}else{
		$is_relate = false;
	}
	*/

	if(($is_order_channel == 1 || $_SESSION["or"]==1) && ($is_addition == 1 || $_SESSION["is"]==1)){
		if(!empty($product_guest_id_str)){
			$where_str.=" and (".$product_guest_id_str.")";
		}

	}else{
		if($is_addition == 1 || $_SESSION["is"]==1){
			if(!empty($product_guest_id_str)){
				$where_str.=" and (".$product_guest_id_str.")";
			}
		}
	}

	if(!check_function(44)){
		$where_str.=" and addition_id=".$_SESSION["user_id"];
	}

	$organ_where = get_check_organ_sql(171,'organ_id','');
	if(!empty($organ_where)){
		$where_str.=" and ".$organ_where;
		$_SESSION['order_list_where'] = $where_str;

	}


	$sql .=$where_str;

	$sql .= " order by id desc";



	$page = new page($sql,"c=first_order".$type_where);
	$param_list = "offset=".$page->get_offset().$type_where;
	$page_result = $page -> get_result(false);

	include 'include/express.config.php';


	$communal_product_id=0;
	$communal_product_ids=array(990,1007,1078,1079);
	$communal_product_ids_two=array(995,1008,1035,1141,1142,1143,1144);
	$communal_product_ids_three=array(1083,1119,1120,959,976,977);

	foreach($page_result as $key => $row){
		if(in_array($row['product_id'],$communal_product_ids)){
			$communal_product_id='990,1007,1078,1079';
		}elseif(in_array($row['product_id'],$communal_product_ids_two)){
			$communal_product_id='995,1008,1035,1141,1142,1143,1144';
		}elseif(in_array($row['product_id'],$communal_product_ids_three)){
			$communal_product_id='1083,1119,1120,959,976,977';
		}else{
			$communal_product_id=$row['product_id'];
		}

		$order_guest_id_array=$page->db->query("select product_id,guest_id,guest_name,addition_id,addition_name,is_valid from orderform where guest_id=".$row['guest_id']." and product_id in (".$communal_product_id.") and id<=".$row['id']." and is_valid=1");
		foreach($order_guest_id_array as $order_val){
			if(in_array($order_val['product_id'],$communal_product_ids)){
				$c_product_id=990;
			}elseif(in_array($order_val['product_id'],$communal_product_ids_two)){
				$c_product_id=995;
			}elseif(in_array($order_val['product_id'],$communal_product_ids_three)){
				$c_product_id=1083;
			}else{
				$c_product_id=$order_val['product_id'];
			}
			$order_kefu_array[$order_val['guest_id']][$c_product_id][]=array(
					'guest_name'   =>   $order_val['guest_name'],
					'addition_id'  =>   $order_val['addition_id'],
					'addition_name'=>   $order_val['addition_name'],
			);

		}






?>
  <tr bgcolor="#ffffff"<?php if($row['is_valid']==0)echo " class=\"deleted\""?>>
	<td align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center" height="30"><a href="order.php?c=amply&order_id=<?php echo $row['id']?>"><?php echo $row['order_code']?></a></td>
	<td align="center">
	<?php
		$gift_list = $page->db->query("select product_id,product_name from gift where gift_type=1 and order_id=".$row['id']);
		foreach($gift_list as $gift){
	?>
	<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift[0]?>"><?php echo $gift[1]?></a></div>
	<?php
		}
	?>
	</td>
	<td align="center"><?php echo $row['product_package_count']?></td>
	<td align="center"><?php if($row['order_type_code'] == 0){echo  (round($row['order_money'],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($row['reserve_money'],1).'</span>+<span style="color:red">'.(round($row['pay_money'],1) ? round($row['pay_money'],1) : round($row['order_money'],1))).'</span>)</span>');}else{echo round($row['order_money'],1);}?></td>

    <td align="center"><a href="user.php?c=amply&user_id=<?php echo (($row['is_valid']==1) ? ($order_kefu_array[$row['guest_id']][$row['product_id']][(count($order_kefu_array[$row['guest_id']][$row['product_id']]))-1]['addition_id']) : $row['addition_id']) ?>"><?php echo (($row['is_valid']==1) ? ($order_kefu_array[$row['guest_id']][$row['product_id']][(count($order_kefu_array[$row['guest_id']][$row['product_id']]))-1]['addition_name']) : $row['addition_name'])?></a></td>


	<td align="center"><a href="user.php?c=amply&user_id=<?php echo (($row['is_valid']==0 && count($order_guest_id_array)==0) ? $row['addition_id'] : ($order_kefu_array[$row['guest_id']][$row['product_id']][0]['addition_id'])) ?>"><?php echo (($row['is_valid']==0 && count($order_guest_id_array)==0) ? $row['addition_name'] : ($order_kefu_array[$row['guest_id']][$row['product_id']][0]['addition_name']))?></a></td>
	<td align="center"><a href="guest.php?c=first_order_amply&guest_id=<?php echo $row['guest_id']?>"><?php echo $row['guest_name']?></a></td>
	<td align="center"><?php echo $row['guest_contact']?></td>
	<td onmouseover="showExpress(<?php echo $row['id']?>)" onmouseout="hideExpress(<?php echo $row['id']?>)">
		<div style="position:relative">
			<div align="center"><?php
				/*
				if($row['express_order_code']){
					$express_log = $page->db->query('select express_data,last_update_time,express_status from express_logs where express_code=\''.$row['express_order_code'].'\'',true,'assoc');
					$express_logs_array = (array)json_decode($express_log['express_data']);
					$express_status = $express_log['express_status'];
				}
				*/
				if($row['express_name']){
					if(strpos($row['express_name'],'-')!==FALSE)$row['express_name']=current(explode('-',$row['express_name']));
					echo $row['express_name'].'：'.$row['express_order_code'];
					$express_status = $row['express_status'];
					if(is_numeric($express_status)){
						echo '<span style="color:#'.$express_status_pointer[$express_status]['color'].';margin-left:5px">['.$express_status_pointer[$express_status]['name'].']</span>';
					}
				}else{
					if($row['assign_express_name'])echo '<span style="color:#ccc">'.$row['assign_express_name'].'</span>';
				}
			?></div>
			<?php

				//设置为空，暂不显示了
				$express_logs_array = array();

				if(count($express_logs_array)){
			?>
				<div style="position:absolute;z-index:1;right:0;top:0;border:1px solid #999;background:#fff;height:46px;overflow:hidden;white-space:nowrap;display:none" id="express_<?php echo $row['id']?>">
					<table width="100%" border="0" cellpadding="0" cellspacing="1">
			<?php
						if(count($express_logs_array)>2){
							$express_logs_array = array_slice($express_logs_array,count($express_logs_array)-2,2);
						}
						foreach($express_logs_array as $log){
							echo '
								<tr>
									<td style="padding:5px 0 0 5px" align="left">'.$log->time.'</td>
									<td style="padding:5px 5px 0 5px" align="left">'.$log->context.'</td>
								</tr>
							';
						}
			?>
					</table>
				</div>
			<?php
				}
			?>
		</div>
	</td>
	<td align="center"><?php
		echo $row['order_state_name'];
	?></td>
	<td align="center">
		<?php echo $row['order_channel_name']?>
	</td>
	<td align="center">
		<?php echo $row['parent']?'<span style="color:#ccc">附属订单</span>':'主订单'?>
	</td>
    <td align="center"><span style="display:none;"><?php echo ($row['is_sent']||$row['order_state_code']==400)?'1':'0'?></span><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row['id']?>" onclick="if(!this.checked)this.parentNode.parentNode.style.background='#fff'"<?php if($row['is_valid']==0)echo' disabled="disabled"'?> /></td>
  </tr>
<?php
	}

?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="14" align="center"><?php $page->show_guide()?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="14" align="center">
		<input name="button" type="button" onclick="command('?c=amend&<?php echo $param_list?>')" value=" 修 改 " />　
		<input name="button" type="button" onclick="window.remove('?c=remove&<?php echo $param_list?>')" value=" 删 除 " />　
		<input name="button" type="button" onclick="command('?c=relate&<?php echo $param_list?>')" value=" 关联附属订单 " />　
		<input name="button" type="button" onclick="selectCheck('reverse')" value=" 反 选 " />　
		<input name="button" type="button" onclick="selectCheck('all')" value=" 全 选 " />
		<?php
			if($_SESSION['is_super'] || (get_organ_info('name')=='晟翔' && in_array($_SESSION["user_name"],array('蒋文龙','阎强','赵静'))) || (get_organ_info('name')=='卓越' && in_array($_SESSION["user_name"],array('刘海霞')))){
		?>
		<span style="display:none1">
		　<select id="output_command">
			<option value="">选择一种报表将全部结果导出</option>
			<option value="first_order_info">订单信息报表</option>
            <?php if($_SESSION['is_super'] || (get_organ_info('name')=='卓越' && in_array($_SESSION["user_name"],array('刘海霞')))){ ?>
            <option value="first_order_rude_total_term">首位订购客服订单统计报表(订单价格为0的不计算在内)</option>
            <?php } ?>
			<option value="guest_info">客户信息资料报表(无重复)</option>
		  </select>
		  <input type="button" id="output_button" value=" 导 出 " onclick="if($('output_command').value!='')window.open('excel.php?c='+$('output_command').value+'<?php echo $w?>')" />
		</span>
		<?php
			}
		?>
	</td>
  </tr>
</table>
</form>

<div style="margin-top:20px;text-align:left">什么是关联关系、主订单和附属订单？</div>
<div style="margin-top:10px;color:#999;text-align:left;line-height:20px">
	订单分为主订单和附属订单两种，主订单和附属订单之间存在一种关联关系，如果一个客服购买了多种产品，那么我们可以为每种产品分别添加独立的订单，然后把他们关联起来，这样系统既可以正常统计销售，也可以将这些订单的所有货物打包在一起发货。
</div>


	</td>
  </tr>
</table>
<?php
}

function first_order_search(){
	check_user();
	unset($_SESSION['addtime']);
	unset($_SESSION['sendtime']);
	$is_product = $_POST["is_product"];
	$is_guest_name = $_POST["is_guest_name"];
	$is_contact = $_POST["is_contact"];
	$is_order_channel_id = $_POST['is_order_channel_id'];
	$is_add_person = $_POST["is_add_person"];
	$is_date = $_POST["is_date"];
	$is_send_date = $_POST["is_send_date"];
	$is_organ = $_POST['is_organ'];
	$where_array = array();


	if($is_product){

		$product_id = $_POST['product_id'];
		$product_class_id = $_POST['product_class_id'];
		if(!is_numeric($product_id)){
			$db = new db(true,true);
			$product_id_array = array_strip($db->query('select id from product where is_valid=1 and class_id='.$product_class_id,'row'));
			if(count($product_id_array)){
				array_push($where_array,'product_id in('.implode(',',$product_id_array).')');
			}else{
				array_push($where_array,'product_id=0');
			}
		}else{
			array_push($where_array,'product_id='.$product_id);
		}

	}

	if($is_guest_name){
		array_push($where_array,"guest_name='".$_POST["guest_name"]."'");
	}

	if($is_contact){
		$contact_type = $_POST["contact_type"];
		$contact_value = $_POST["contact_value"];
		foreach($contact_value as $key => $value){
			if($value!=""){
				array_push($where_array,"guest_contact like'%".$contact_type[$key]."：".$value."%'");
			}
		}
	}

	if($is_order_channel_id){
		array_push($where_array,"order_channel_id=".$_POST["order_channel_id"]);
		$is_order_channel=1;
	}

	if($is_add_person){
		array_push($where_array,"addition_id=".$_POST["add_person"]);

		$db=new db(true,true);

		$organ_id=$db->query("select organ_id from user where id=".$_POST["add_person"],true,true);

		if($organ_id !=7){
			$is_addition=1;
		}

	}

	if($is_date){
		$begin_date = $_POST["begin_date"];
		$begin_hour = $_POST['begin_hour'];
		$begin_minute = $_POST['begin_minute'];
		$end_date = $_POST["end_date"];
		$end_hour = $_POST['end_hour'];
		$end_minute = $_POST['end_minute'];
		if(!empty($begin_hour)){
			if(empty($begin_minute)){
				$begin_minute = 0;
			}
			$begin_date .= " $begin_hour:$begin_minute:0";
		}
		if(!empty($end_hour)){
			if(empty($end_minute)){
				$end_minute = 59;
			}
		}else{
			$end_hour = 23;
			$end_minute = 59;
		}
		$end_date .= " $end_hour:$end_minute:59";
		array_push($where_array,"add_time>='$begin_date'");
		array_push($where_array,"add_time<='$end_date'");
		$_SESSION['addtime']=" and add_time>='".$begin_date."' and add_time<='".$end_date."'";

	}


	if($is_send_date){
		$begin_date = $_POST["begin_send_date"];
		$begin_hour = $_POST['begin_send_hour'];
		$begin_minute = $_POST['begin_send_minute'];
		$end_date = $_POST["end_send_date"];
		$end_hour = $_POST['end_send_hour'];
		$end_minute = $_POST['end_send_minute'];
		if(!empty($begin_hour)){
			if(empty($begin_minute)){
				$begin_minute = 0;
			}
			$begin_date .= " $begin_hour:$begin_minute:0";
		}
		if(!empty($end_hour)){
			if(empty($end_minute)){
				$end_minute = 59;
			}
		}else{
			$end_hour = 23;
			$end_minute = 59;
		}
		$end_date .= " $end_hour:$end_minute:59";
		array_push($where_array,"send_time>='$begin_date'");
		array_push($where_array,"send_time<='$end_date'");
		$_SESSION['sendtime']=" and send_time>='".$begin_date."' and send_time<='".$end_date."'";
	}

	if($is_organ){
		array_push($where_array,"organ_id=".$_POST["organ"]);
	}

	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){
		$db=new db(true,true);


		$user_team_id_array=array_strip($_SESSION['user_team']);
		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

	}

	if($product_list){
		array_push($where_array,"product_id in (".$product_list.")");
	}




	$where = ' where ' .implode(" and ",$where_array);
	if($where==""){
		include_once("include/guide.php");
		$guide = new guide();
		$guide -> set_message("对不起，筛选条件为空或没有找到相关记录！",true);
		$guide -> append("继续筛选","?c=term");
		$guide -> append("订单列表","order.php");
		$guide -> out();
	}
	//append_log("2","客服订单筛选器",$where);
	//header("location:?w=".encode($where));
	//header('location:?t=search');
	first_order(encode($where),$is_addition,$is_order_channel);
}

function term(){
	check_user(48);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
	var itemIndex = 0;
	function checkForm(){
		var checkList = ["is_order_code","is_order_name","is_product","is_product_package_count","is_guest_name","is_guest_region","is_guest_address","is_guest_postcode","is_contact","is_order_type_code","is_order_channel_id","is_order_state_code","is_express_order_code","is_add_person","is_money_person","is_send_person","is_express_id","is_date","is_express_status","is_organ","is_order_delete_state"];
		var alertList = ["输入订单号",,"选择产品或产品组","输入产品数量","输入客户姓名","选择地区","输入收货地址","输入收货邮编",,,"选择订购渠道",,"输入发货单号","选择客服人员","选择到款处理人","选择发货处理人","选择快递公司",'选择快递单状态',,'选择所属机构'];
		var choosedList = [];
		var isExists = false;
		for(var i=0;i<checkList.length;i++){
			if(document.forms[0].elements[checkList[i]].checked){
				var checkName = checkList[i].replace("is_","");
				if(checkName=="guest_region")checkName="sheng";
				if(checkName=='product')checkName='product_class_child';
				isExists = true;
				if(checkName!="order_name"&&checkName!="guest_region"&&checkName!="contact"){
					choosedList.push([checkName,i]);
				}
			}
		}
		if(isExists){
			for(var i=0;i<choosedList.length;i++){
				if(choosedList[i][0]=="date"){
					var beginDate = document.forms[0].elements["begin_date"].value;
					var endDate = document.forms[0].elements["end_date"].value;
					if(beginDate==""){
						alert("请选择开始始时间！");
						return;
					}
					if(endDate==""){
						alert("请选择结束时间！");
						return;
					}
					beginDateArray = beginDate.split("-");
					beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
					endDateArray = endDate.split("-");
					endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
					if(Date.parse(beginDate)>Date.parse(endDate)){
						alert("开始时间不能大于结束时间！");
						return;
					}
				}else if(choosedList[i][0]=="product"){
					if($('product_group_child').style.display!='none' && $('product_group_child').length==1){
						alert('您选择的产品组下没有任何单品！');
						return;
					}
				}else{
					if(document.forms[0].elements[choosedList[i][0]].value==""){
						alert("请"+alertList[choosedList[i][1]]+"！");
						return;
					}
					if(choosedList[i][0]=="product_package_count"){
						if(/\D/.test(document.forms[0].elements[choosedList[i][0]].value)){
							alert("产品数量必须为数字！");
							return ;
						}
					}
				}

			}

			$('btn').disabled=true;
			with(document.forms[0]){
				action = "?c=search";
				method = "post";
				submit();
			}
		}else{
			alert("请至少选择一个筛选条件！");
		}
	}

	window.onload=function(){

		autoChoose({

			'product_class'		:	'product',
			'product_class_child':	'product',
			'product_group_child':	'product',

			'sheng'				:	'guest_region',

			'contact_type[]'	:	'contact',
			'contact_value[]'	:	'contact',

			'order_channel_id'	:	'order_channel_id',

			'begin_date'		:	'date',
			'begin_hour'		:	'date',
			'begin_minute'		:	'date',
			'end_date'			:	'date',
			'end_hour'			:	'date',
			'end_minute'		:	'date'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">订单筛选器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="9%" height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_code" value="true" /></td>
    <td width="16%" align="center" bgcolor="#f3f3f3"><strong>订单编号：</strong></td>
    <td width="75%" align="left"><input type="text" name="order_code" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td width="9%" height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_name" value="true" /></td>
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单名称：</strong></td>
    <td width="75%" align="left"><input type="text" name="order_name" /></td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品名称：</strong></td>
    <td width="75%" align="left" style="padding:10px">
		<script type="text/javascript" src="js/product.php"></script>
		<div style="border:1px solid #ddd;background:#fcfcfc;padding:5px 10px;line-height:24px;margin-top:10px;color:#999">已支持允许选择产品组了哦，而不需要总是必须选中一个单品</div>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product_package_count" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品疗程数量：</strong></td>
    <td width="75%" align="left"><input type="text" name="product_package_count" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_name" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="75%" align="left"><input name="guest_name" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_region" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户地区：</strong></td>
    <td width="75%" align="left">
		<script type="text/javascript" src="js/region.php"></script>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_address" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货地址：</strong></td>
    <td width="75%" align="left"><input name="guest_address" type="text" size="50" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_postcode" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货邮编：</strong></td>
    <td width="75%" align="left"><input name="guest_postcode" type="text" maxlength="6" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_contact" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>联系方式：</strong></td>
    <td width="75%" align="left" id="ContactBlock">
	<div>
		<span id="ItemTemplate">
		<select name="contact_type[]">
		<?php
			$db = new db(true);
			$item_result = $db -> query("select item_name from contact where is_valid=1");
			foreach($item_result as $item){
				echo "<option value=\"".$item[0]."\">".$item[0]."</option>";
			}
		?>
    	</select>
		<input name="contact_value[]" type="text" maxlength="30" />
		</span>
		<input type="button" value="添加新项" onclick="insertItem()" />
	</div>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_type_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>支付方式：</strong></td>
    <td width="75%" align="left">
		<label><input type="radio" name="order_type_code" value="0" checked="checked" />货到付款</label>
        <label><input type="radio" name="order_type_code" value="1" />款到发货</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_channel_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="75%" align="left">
	<?php
	$order_channel_result = $db -> query("select id,name from order_channel where is_valid = 1");
	?>
	<select name="order_channel_id">
	<option value="">选择订购渠道</option>
	<?php
		foreach($order_channel_result as $order_channel_item){
	?>
	<option value="<?php echo $order_channel_item[0]?>"><?php echo $order_channel_item[1]?></option>
	<?php
		}
	?>
    </select>
	</td>
  </tr>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_state_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单状态：</strong></td>
    <td width="75%" align="left">
	<?php
		$order_state = array("未发布的草稿","等待财务部确认到款","等待发货部处理发货","正在处理发货","等待发货部确认收到退货","已经退货","已完成");
	?>
	<select name="order_state_code">
	<?php
		foreach($order_state as $key => $value){
	?>
	<option value="<?php echo $key+1?>00"><?php echo $value?></option>
	<?php
		}
	?>
    </select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express_order_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货单号：</strong></td>
    <td width="75%" align="left"><input type="text" name="express_order_code" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_add_person" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服人员：</strong></td>
    <td width="75%" align="left">
	<select name="add_person">
	<option value="">请选择客服人员</option>
	<?php
		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

			$user_list=implode(',',array_strip($user_array));

		}

		if($user_list){
			$where_user=" and user.id in (".$user_list.")";
		}

        $result = $db -> query("select user.id,user.name,user.enable,organ.name from user inner join organ on organ.id=user.organ_id where user.group_id=1 and user.is_valid=1".$where_user." order by enable desc,organ.id,user.name");

		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\"";
			if(!$row[2])echo ' style="color:#ccc"';
			echo ">".$row[1]." [" . $row[3] . "]</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_money_person" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>到款处理人：</strong></td>
    <td width="75%" align="left">
	<select name="money_person">
	<option value="">请选择到款处理人</option>
	<?php
		$result = $db -> query("select id,name from user where (group_id=0 or group_id=4) and is_valid=1");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_person" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货处理人：</strong></td>
    <td width="75%" align="left">
	<select name="send_person">
	<option value="">请选择发货处理人</option>
	<?php
		$result = $db -> query("select id,name from user where (group_id=0 or group_id=5) and is_valid=1");
		foreach($result as $key => $row){

			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司：</strong></td>
    <td width="75%" align="left">
	<select name="express_id">
	<option value="all">所有快递公司</option>
	<?php
		$result = $db -> query("select id,express_name from express where is_valid=1".get_check_organ_sql(172)." order by order_index asc,id asc");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_date" type="checkbox" id="is_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>按添加时间段：</strong></td>
    <td width="75%" align="left"><input name="begin_date" type="text" id="begin_date" onclick="showCalendar('begin_date','%Y-%m-%d',false,false,'begin_date')" size="10" readonly="true"/>
		<script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';
			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="begin_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="begin_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	— <input name="end_date" type="text" id="end_date" onclick="showCalendar('end_date','%Y-%m-%d',false,false,'end_date')" size="10" readonly="true"/>
		<select name="end_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="end_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express_status" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递单状态：</strong></td>
    <td width="75%" align="left">
		<select name="express_status">
		<option value="">请选择快递单状态</option>
		<?php
			include 'include/express.config.php';
			foreach($express_status_pointer as $status => $status_data){
		?>
			<option value="<?php echo $status?>"><?php echo $status_data['name']?></option>
		<?php
			}
		?>
		</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_organ" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="75%" align="left">
		<?php
			organ_select(171);
		?>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_delete_state" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单删除状态：</strong></td>
    <td width="75%" align="left">
		<select name="order_delete_state">
			<option value="1">未删除的订单</option>
			<option value="0">已删除的订单</option>
		</select>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 筛 选 " onclick="checkForm()" id="btn" style="height:35px;width:90px;margin-right:40px" />
		<input type="reset" value=" 清 除 " style="height:35px;width:90px" />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function first_order_term(){
	check_user(207);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
	var itemIndex = 0;
	function checkForm(){
		var checkList = ["is_product","is_guest_name","is_contact","is_order_channel_id","is_add_person","is_date","is_send_date","is_organ"];
		var alertList = ["选择产品或产品组","输入客户姓名",,"选择订购渠道","选择客服人员",,,'选择所属机构'];
		var choosedList = [];
		var isExists = false;
		for(var i=0;i<checkList.length;i++){
			if(document.forms[0].elements[checkList[i]].checked){
				var checkName = checkList[i].replace("is_","");
				if(checkName=='product')checkName='product_class_child';
				isExists = true;
				if(checkName!="order_name"&&checkName!="guest_region"&&checkName!="contact"){
					choosedList.push([checkName,i]);
				}
			}
		}
		if(isExists){
			for(var i=0;i<choosedList.length;i++){
				if(choosedList[i][0]=="date"){
					var beginDate = document.forms[0].elements["begin_date"].value;
					var endDate = document.forms[0].elements["end_date"].value;
					if(beginDate==""){
						alert("请选择开始始时间！");
						return;
					}
					if(endDate==""){
						alert("请选择结束时间！");
						return;
					}
					beginDateArray = beginDate.split("-");
					beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
					endDateArray = endDate.split("-");
					endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
					if(Date.parse(beginDate)>Date.parse(endDate)){
						alert("开始时间不能大于结束时间！");
						return;
					}
				}else if(choosedList[i][0]=="send_date"){
					var beginDate = document.forms[0].elements["begin_send_date"].value;
					var endDate = document.forms[0].elements["end_send_date"].value;
					if(beginDate==""){
						alert("请选择开始始时间！");
						return;
					}
					if(endDate==""){
						alert("请选择结束时间！");
						return;
					}
					beginDateArray = beginDate.split("-");
					beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
					endDateArray = endDate.split("-");
					endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
					if(Date.parse(beginDate)>Date.parse(endDate)){
						alert("开始时间不能大于结束时间！");
						return;
					}else if(choosedList[i][0]=="product"){
						if($('product_group_child').style.display!='none' && $('product_group_child').length==1){
							alert('您选择的产品组下没有任何单品！');
							return;
						}
					}
				}else{
					if(document.forms[0].elements[choosedList[i][0]].value==""){
						alert("请"+alertList[choosedList[i][1]]+"！");
						return;
					}
				}

			}

			$('btn').disabled=true;
			with(document.forms[0]){
				action = "?c=first_order_search";
				method = "post";
				submit();
			}
		}else{
			alert("请至少选择一个筛选条件！");
		}
	}

	window.onload=function(){

		autoChoose({

			'product_class'		    :	'product',
			'product_class_child'   :	'product',
			'product_group_child'   :	'product',



			'contact_type[]'		:	'contact',
			'contact_value[]'		:	'contact',

			'order_channel_id'		:	'order_channel_id',

			'begin_date'			:	'date',
			'begin_hour'			:	'date',
			'begin_minute'			:	'date',
			'end_date'				:	'date',
			'end_hour'			    :	'date',
			'end_minute'		    :	'date',

			'begin_send_date'		:	'send_date',
			'begin_send_hour'		:	'send_date',
			'begin_send_minute'		:	'send_date',
			'end_send_date'			:	'send_date',
			'end_send_hour'			:	'send_date',
			'end_send_minute'		:	'send_date'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">首位订购客服订单筛选器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品名称：</strong></td>
    <td width="75%" align="left" style="padding:10px">
		<script type="text/javascript" src="js/product.php"></script>
		<div style="border:1px solid #ddd;background:#fcfcfc;padding:5px 10px;line-height:24px;margin-top:10px;color:#999">已支持允许选择产品组了哦，而不需要总是必须选中一个单品</div>
	</td>
  </tr>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_name" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="75%" align="left"><input name="guest_name" type="text" /></td>
  </tr>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_contact" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>联系方式：</strong></td>
    <td width="75%" align="left" id="ContactBlock">
	<div>
		<span id="ItemTemplate">
		<select name="contact_type[]">
		<?php
			$db = new db(true);
			$item_result = $db -> query("select item_name from contact where is_valid=1");
			foreach($item_result as $item){
				echo "<option value=\"".$item[0]."\">".$item[0]."</option>";
			}
		?>
    	</select>
		<input name="contact_value[]" type="text" maxlength="30" />
		</span>
		<input type="button" value="添加新项" onclick="insertItem()" />
	</div>
	</td>
  </tr>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_channel_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="75%" align="left">
	<?php
	$order_channel_result = $db -> query("select id,name from order_channel where is_valid = 1");
	?>
	<select name="order_channel_id">
	<option value="">选择订购渠道</option>

    <option value="6">电话回访复购</option>
    <option value="17">主动复购增销</option>
    <option value="22">健敏舒回访</option>
	<option value="23">CRM中心二次销售</option>
    </select>
	</td>
  </tr>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_add_person" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服人员：</strong></td>
    <td width="75%" align="left">
	<select name="add_person">
	<option value="">请选择客服人员</option>
	<?php
		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

			$user_list=implode(',',array_strip($user_array));

		}

		if($user_list){
			$where_user=" and user.id in (".$user_list.")";
		}

        $result = $db -> query("select user.id,user.name,user.enable,organ.name from user inner join organ on organ.id=user.organ_id where user.group_id=1 and user.is_valid=1".$where_user." order by enable desc,organ.id,user.name");

		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\"";
			if(!$row[2])echo ' style="color:#ccc"';
			echo ">".$row[1]." [" . $row[3] . "]</option>\n";
		}
	?>
	</select>
	</td>
  </tr>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_date" type="checkbox" id="is_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>按添加时间段：</strong></td>
    <td width="75%" align="left"><input name="begin_date" type="text" id="begin_date" onclick="showCalendar('begin_date','%Y-%m-%d',false,false,'begin_date')" size="10" readonly="true"/>
		<script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';

			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="begin_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="begin_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	— <input name="end_date" type="text" id="end_date" onclick="showCalendar('end_date','%Y-%m-%d',false,false,'end_date')" size="10" readonly="true"/>
		<select name="end_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="end_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_send_date" type="checkbox" id="is_send_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>按发货时间段：</strong></td>
    <td width="75%" align="left"><input name="begin_send_date" type="text" id="begin_send_date" onclick="showCalendar('begin_send_date','%Y-%m-%d',false,false,'begin_send_date')" size="10" readonly="true"/>
		<script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';
			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="begin_send_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="begin_send_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	— <input name="end_send_date" type="text" id="end_send_date" onclick="showCalendar('end_send_date','%Y-%m-%d',false,false,'end_send_date')" size="10" readonly="true"/>
		<select name="end_send_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="end_send_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_organ" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="75%" align="left">
		<?php
			organ_select(171);
		?>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 筛 选 " onclick="checkForm()" id="btn" style="height:35px;width:90px;margin-right:40px" />
		<input type="reset" value=" 清 除 " style="height:35px;width:90px" />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>

<?php
}

function append(){
    //exit('系统维护中,请稍候...');

	check_user(42);
	$guest_id = $_GET["guest_id"];
	if(!isset($guest_id)){
		$guest_id = get_selected(false,1);
	}
	if(!is_numeric($guest_id)){
		location("back","请先选择要添加订单的客户！");
	}
	global $db;
	$db = new db(true);
	if($_GET["method"]=="post"){
		include_once("include/guide.php");
		$guide = new guide();
		$order_code = $_POST["order_code"];
		if(empty($order_code)){
			$guide -> set_message("对不起，订单编号为空,订单添加失败！",true);
            $guide -> append("继续添加新订单","order.php?c=append&guest_id=".$guest_id);
		}else{
			$search_count = $db -> query("select count(*) from orderform where order_code='".$order_code."'",true,true);
			if($search_count>0){
				$guide -> set_message("对不起，订单号[$order_code]已经存在，不允许重复添加！",true);
			}else{
				$order_name = $_POST["order_name"];
				$active_tag_id = $_POST["active_tag_id"] ? $_POST["active_tag_id"]: 0;
				//$product_id = $_POST["product_id"];
				//$product = $db -> query("select name,package_price from product where id=".$product_id,true);
				$product_package_count = $_POST["product_package_count"];
				//$product_name = $product[0];
				//$product_package_price = $product[1];
				//$product_unit_count = $_POST["product_unit_count"];
				$order_money = $_POST["order_money"];
				$reserve_money=$_POST['reserve_money'];
				$pay_money=$_POST['pay_money'];
				$guest_name = $_POST["guest_name"];
				$guest_age  = intval($_POST["guest_age"]);

				if($guest_age){
					$now_year=date("Y");
					$birth_year=intval($now_year-$guest_age);
					$db->update('customer',array('guest_age'=>$guest_age,'birth_year'=>$birth_year),$guest_id);
				}


				$region = $guest_region = get_region();
				$guest_address = $_POST["guest_address"];
				$guest_postcode = $_POST["guest_postcode"];
				$order_type_code = $_POST["order_type_code"];

				if($order_type_code==0){
                    $get_money_deal_code=$_POST['get_type0_money_deal_code'];
				}elseif($order_type_code==1){
                    $get_money_deal_code=$_POST['get_money_deal_code'];

				}

				$bank_money_date=$_POST['bank_money_date'];
				$bank_money_hour=$_POST['bank_money_hour'];
				$bank_money_minute=$_POST['bank_money_minute'];

				if($bank_money_date == ''){
					$bank_money_date=0;
				}elseif($bank_money_hour == ''){
					$bank_money_hour=0;
				}elseif($bank_money_minute == ''){
					$bank_money_minute=0;
				}

				if($bank_money_date == 0 && $bank_money_hour == 0 && $bank_money_minute == 0){
					$bank_money_time='';
				}else{
					$bank_money_time.=$bank_money_date." $bank_money_hour:$bank_money_minute";
				}
				$bank_money_account_name=$_POST['bank_money_account_name'];


				$expect_time = ($order_type_code==1)?$_POST["expect_time"]:"";
				$bank_name = $_POST["bank_name"];
				$bank_code = $_POST["bank_code"];

				$order_channel = $_POST['order_channel'];
				if(strpos($order_channel,"|")>0){
					$order_channel_array = explode("|",$order_channel);
					$order_channel_id = $order_channel_array[0];
					$order_channel_name = $order_channel_array[1];
				}else{
					$order_channel_id = 0;
					$order_channel_name = '';
				}
				$resources_add_day = $_POST['resources_add_day'] ? strtotime($_POST['resources_add_day']) : '';
				$guest_update = $_POST["guest_update"];
				$publish_type = $_POST["publish_type"];
				$order_intro = $_POST["order_intro"];

				//$organ_id = $_SESSION['organ_id'];  //暂时先用用户本身的机构ID
				//以上作废

				$organ_id = $_POST['organ'];
				if(empty($organ_id))$organ_id = $db->query("select organ_id from customer where id=$guest_id",true,true);


				$user_id = $_SESSION["user_id"];
				$user_name = $_SESSION["user_name"];
				$user = $db -> query("select mobile,phone from user where id=".$user_id,true);
				if($user[0]!=""){
					$user_phone = "手机：".$user[0]."<br />";
				}
				if($user[1]!=""){
					$user_phone .= "座机：".$user[1];
				}

				$order_logs = '<div class="intro_title">['.$user_name.']于['.get_time().']创建了订单</div>';
				if(!empty($order_intro)){
					$order_logs .= '<div class="intro_content">'.$order_intro.'</div>';
					$order_intro = '['.$user_name.']'.$order_intro;
				}
				$order_logs = addslashes($order_logs);
				$order_intro = addslashes($order_intro);

				foreach($_POST["contact_value"] as $key => $value){
					if($value){
						$guest_contact .= $_POST["contact_type"][$key]."：".$value;
						if($key<count($_POST["contact_value"])-1){
							$guest_contact .= "<br />";
						}
					}
				}

				$order_type_name = ($order_type_code==0)?"货到付款":"款到发货";
				if($guest_update){
					$db -> execute("update customer set name='".$guest_name."',diqu_code='".$guest_region[0]."',diqu_name='".$guest_region[1]."',address='".$guest_address."',post='".$guest_postcode."' where id=".$guest_id);
					$db -> execute("delete from customercontact where id_Customer=".$guest_id);
					$time = get_time();
					foreach($_POST["contact_value"] as $key => $value){
						if($value){
							$db -> execute("insert customercontact(type,content,id_Customer,name_Customer,time_Add) values('".$_POST["contact_type"][$key]."','".$value."',".$guest_id.",'".$_POST["guest_name"]."','".$time."')");
						}
					}
				}

				$assign_express_id = $_POST['assign_express_id'];
				if(!is_numeric($assign_express_id))$assign_express_id=0;
				if($assign_express_id){
					$assign_express_name = $db->query('select express_name from express where id='.$assign_express_id,true,true);
				}

				//是否允许发货
				$is_allow_send = $_POST['is_allow_send'];


				if($publish_type==1){
					$order_state_code = "100";
					$order_state_name = "尚未发布的草稿";
				}else{
					if($order_type_code==0){
						if($reserve_money > 0){
                            $order_state_code = "150";
                            $order_state_name = '等待财务部确认收到订金';
                        }else{
                            $order_state_code = "300";
                            $order_state_name = "等待发货部处理发货";
                        }
					}else{
						$order_state_code = "200";
						$order_state_name = "等待财务部确认到款";
					}
				}


				$gift_product_id = (array)$_POST["gift_product_id"];
				$gift_product_name = $_POST["gift_product_name"];
				$gift_product_count = $_POST["gift_product_count"];
				$gift_product_money = $_POST["gift_product_money"];
				$gift_product_type = $_POST["gift_product_type"];

				//判断库存
				$product_data = array();
				foreach($gift_product_id as $key => $value){
					if(empty($product_data[$value])){
                        $product_data[$value] = array(
                            'id' => $value,
                            'name' => $gift_product_name[$key],
                            'count' => $gift_product_count[$key],
                        );
					}else{
                        $product_data[$value]['count'] += $gift_product_count[$key];
					}
                }

                $stock_result = $db->query('select id,stock_count from product where id in('.implode(',',$gift_product_id).')');
                $stock = array();
                foreach($stock_result as $row){
                    $stock[$row[0]] = $row[1];
                }
				foreach($product_data as $product){
                    if($stock[$product['id']]<$product['count']){
                        $message .= $product['name'].' 剩余库存['.$stock[$product['id']].'] 小于 发货数量['.$product['count'].']<br />';
                    }
				}

				if(empty($message)){

					//取出第一个不是赠品的产品做为主产品
					foreach($gift_product_id as $key => $value){
						if($gift_product_type[$key]==1){
							$main_product_id = $value;
							$main_product_name = $gift_product_name[$key];
							break;
						}
					}

					//如果没有找到，说明订单内全部是赠品，那么就取第一个赠品作为主产品
					if(!$main_product_id){
						$main_product_id = $gift_product_id[0];
						$main_product_name = $gift_product_name[0];
					}


					$phase_package = 0;

					//取出产品的阶段参数
					$phase_sql = 'select phase_list from product_phase where product_id='.$main_product_id.' and package=';
					for($i=$product_package_count;$i>0;$i--){
						$phase_list = $db->query($phase_sql.$i,true,true);
						if(!empty($phase_list)){
							$phase_package = $i;
							break;
						}
					}

					$phase_count = !empty($phase_list)?count(explode(' ',$phase_list)):0;
					$phase_count++;


					//记录更新数据的日志数组
					$data_update_logs_array = array();


					$order_id = $db->insert('orderform',array(
						'order_code'				=>		$order_code,
						'order_name'				=>		$order_name,
						'active_tag_id'				=>		$active_tag_id,
						'product_package_count'		=>		$product_package_count,
						'order_money'				=>		$order_money,
						'reserve_money'				=>      $reserve_money,
						'pay_money'					=>      $pay_money,
						'guest_id'					=>		$guest_id,
						'guest_name'				=>		$guest_name,
						'guest_age'					=>      $guest_age,
						'guest_region_code'			=>		$guest_region[0],
						'guest_region_name'			=>		$guest_region[1],
						'guest_region_province_code'=>		$region[2][0],
						'guest_region_city_code'	=>		$region[2][1],
						'guest_region_district_code'=>		$region[2][2],
						'guest_address'				=>		$guest_address,
						'guest_contact'				=>		$guest_contact,
						'guest_postcode'			=>		$guest_postcode,
						'order_type_code'			=>		$order_type_code,
						'order_type_name'			=>		$order_type_name,
						'bank_money_time'			=>      $bank_money_time,
						'bank_money_account_name'	=>      $bank_money_account_name,
						'get_money_deal_code'		=>      $get_money_deal_code,
						'money_bank_name'			=>		$bank_name,
						'money_bank_code'			=>		$bank_code,
						'money_expect_time'			=>		$expect_time,
						'order_channel_id'			=>		$order_channel_id,
						'order_channel_name'		=>		$order_channel_name,
						'order_state_code'			=>		$order_state_code,
						'order_state_name'			=>		$order_state_name,
						'is_allow_send'				=>		$is_allow_send,
						'order_intro'				=>		$order_intro,
						'order_logs'				=>		$order_logs,
						'addition_id'				=>		$user_id,
						'addition_name'				=>		$user_name,
						'addition_phone'			=>		$user_phone,
						'add_time'					=>		get_time(),
						'resources_add_day'			=>      $resources_add_day,
						'organ_id'					=>		$organ_id,
						'assign_express_id'			=>		$assign_express_id,
						'assign_express_name'		=>		$assign_express_name,
						'product_id'				=>		$main_product_id,
						'product_name'				=>		$main_product_name,

						'phase_list'				=>		$phase_list,
						'phase_count'				=>		$phase_count,
						'phase_package'				=>		$phase_package,
                        'wechat_id'                 =>      intval($_POST['wechat_id'])

					));

					//用上面的代替

                    //$db -> execute("insert into orderform(order_code,order_name,product_package_count,order_money,guest_id,guest_name,guest_region_code,guest_region_name,guest_region_province_code,guest_region_city_code,guest_region_district_code,guest_address,guest_contact,guest_postcode,order_type_code,order_type_name,money_bank_name,money_bank_code,money_expect_time,order_channel_id,order_channel_name,order_state_code,order_state_name,is_allow_send,order_intro,order_logs,addition_id,addition_name,addition_phone,add_time,organ_id,assign_express_id,assign_express_name) values('".$order_code."','".$order_name."',".$product_package_count.",".$order_money.",".$guest_id.",'".$guest_name."','".$guest_region[0]."','".$guest_region[1]."',{$region[2][0]},{$region[2][1]},{$region[2][2]},'".$guest_address."','".$guest_contact."','".$guest_postcode."',".$order_type_code.",'".$order_type_name."','".$bank_name."','".$bank_code."','".$expect_time."',".$order_channel_id.",'".$order_channel_name."',".$order_state_code.",'".$order_state_name."',".$is_allow_send.",'".$order_intro."','".$order_logs."',".$user_id.",'".$user_name."','".$user_phone."','".get_time()."',$organ_id,$assign_express_id,'$assign_express_name')");

					if($order_id){

						$db->update('customer',array(
							'last_order_time'	=>	get_time(),
						),$guest_id);

						//将添加订单的数据加入到更新日志
						$data_update_logs_array['insert_orderform'] = array(
							'order_id'					=>		$order_id,
							'order_code'				=>		$order_code,
							'order_name'				=>		$order_name,
							'active_tag_id'				=>		$active_tag_id,
							'product_package_count'		=>		$product_package_count,
							'order_money'				=>		$order_money,
							'reserve_money'				=>      $reserve_money,
                            'pay_money'					=>      $pay_money,
							'guest_id'					=>		$guest_id,
							'guest_name'				=>		$guest_name,
							'guest_age'				    =>      $guest_age,
							'guest_region_code'			=>		$guest_region[0],
							'guest_region_name'			=>		$guest_region[1],
							'guest_region_province_code'=>		$region[2][0],
							'guest_region_city_code'	=>		$region[2][1],
							'guest_region_district_code'=>		$region[2][2],
							'guest_address'				=>		$guest_address,
							'guest_contact'				=>		$guest_contact,
							'guest_postcode'			=>		$guest_postcode,
							'order_type_code'			=>		$order_type_code,
							'order_type_name'			=>		$order_type_name,
							'bank_money_time'			=>      $bank_money_time,
							'bank_money_account_name'	=>      $bank_money_account_name,
							'get_money_deal_code'		=>      $get_money_deal_code,
							'money_bank_name'			=>		$bank_name,
							'money_bank_code'			=>		$bank_code,
							'money_expect_time'			=>		$expect_time,
							'order_channel_id'			=>		$order_channel_id,
							'order_channel_name'		=>		$order_channel_name,
							'order_state_code'			=>		$order_state_code,
							'order_state_name'			=>		$order_state_name,
							'is_allow_send'				=>		$is_allow_send,
							'order_intro'				=>		$order_intro,
							'order_logs'				=>		$order_logs,
							'addition_id'				=>		$user_id,
							'addition_name'				=>		$user_name,
							'addition_phone'			=>		$user_phone,
							'add_time'					=>		get_time(),
							'resources_add_day'			=>      $resources_add_day,
							'organ_id'					=>		$organ_id,
							'assign_express_id'			=>		$assign_express_id,
							'assign_express_name'		=>		$assign_express_name,
							'product_id'				=>		$main_product_id,
							'product_name'				=>		$main_product_name,
						);


                    	$data_update_logs_array['insert_gift'] = array();
						foreach($gift_product_id as $key => $value){
							$db -> execute("insert into gift(order_id,product_id,product_name,product_count,gift_money,gift_type) values(".$order_id.",".$value.",'".$gift_product_name[$key]."',".$gift_product_count[$key].",'".$gift_product_money[$key]."',".$gift_product_type[$key].")");

							//将添加订购产品的数据加入到更新日志
							$data_update_logs_array['insert_gift'][] = array(

								'order_id'			=>	$order_id,
								'product_id'		=>	$value,
								'product_name'		=>	$gift_product_name[$key],
								'product_count'		=>	$gift_product_count[$key],
								'gift_money'		=>	$gift_product_money[$key],
								'gift_type'			=>	$gift_product_type[$key],
							);

						}

						//减库存
						foreach($product_data as $product){
							$db->execute('update product set stock_count=stock_count-'.$product['count'].' where id='.$product['id']);

							$organ_id = $db->query("select c.organ_id from product as p,product_class as c where p.id=".$product['id']." and p.class_id=c.id",true,true);
							//写入出库单
							$db->insert('outputrecord',array(
								'type'			=>	1,
								'product_id'	=>	$product['id'],
								'product_name'	=>	$product['name'],
								'unit_count'	=>	$product['count'],
								'output_time'	=>	get_time(),
								'person_id'		=>	$_SESSION['user_id'],
								'person_name'	=>	$_SESSION['user_name'],
								'state'			=>	1,
								'order_id'		=>	$order_id,
								'organ_id'		=>	$organ_id,
							));
						}

						//清除缺货缓存
						clear_cache('oos_product',true);

						$guide -> set_message("订单添加成功！");
						$guide -> append("查看该新订单详细页","order.php?c=amply&order_id=".$order_id);
						$guide -> append("继续为该客户添加订单","order.php?c=append&guest_id=".$guest_id);


						//将更新数据写入到日志文件中
						append_update_logs('append_order',$data_update_logs_array);


					}else{
						$guide -> set_message("订单未能添加成功！",true);
						$guide -> append("继续为该客户添加订单","order.php?c=append&guest_id=".$guest_id);
					}
                }else{
                    $guide -> set_message("您所添加的产品中，部分产品剩余库存不足，具体详情如下：",true);
                    $guide -> set_intro($message);
                    $guide -> append("返回上一页添加订单","order.php?c=append&guest_id=".$guest_id);
                }

			}
		}
		$guide -> append("查看所有订单列表","order.php");
		$guide -> append("查看该客户的所有订单","order.php?w=" . encode("guest_id=".$guest_id));
		$guide -> append("查看客户信息","guest.php?c=amply&guest_id=".$guest_id);
		$guide -> out();
	}
	$wx_result = $db->query("select * from wechat where user_id = ".$_SESSION['user_id']);
	$guest_result = $db -> query("select name,diqu_code,address,post,organ_id,guest_age from customer where id=".$guest_id,true);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/product.php?auto=false"></script>
<script type="text/javascript" src="js/append_product.js"></script>
<script type="text/javascript" src="js/guide.js"></script>
<script type="text/javascript" src="js/window.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
var itemIndex = 0;
function checkForm(){
	with(document.forms[0]){
		if(order_code.value==""){
			alert("订单编号不能为空！");
			order_code.focus();
			return;
		}
		if(isExistSpace(order_name.value)){
			alert("订单名称中不允许包含空格！");
			order_name.select();
			return;
		}
		if($("gift_list").childNodes.length==0){
			alert("请添加产品！");
			return;
		}
		if(product_package_count.value==""){
			alert("请输入产品疗程数量！");
			product_package_count.focus();
			return;
		}
		if(/\D/.test(product_package_count.value)){
			alert("产品疗程数量必须为数字！");
			product_package_count.select();
			return;
		}

//		if(product_unit_count.value==""){
//			alert("请输入产品总盒数！");
//			return;
//		}
//		if(/\D/.test(product_unit_count.value)){
//			alert("总盒数必须为数字！");
//			return;
//		}
		if(order_money.value==""){
			alert("请输入订单金额！");
			order_money.focus();
			return;
		}
		if(!/^\d+(\.\d{1})?$/.test(order_money.value)){
			alert("订单金额必须为整数或者一位小数！");
			order_money.select();
			return;
		}
		if(resources_add_day.value ==""){
			alert("请填写客户资源添加时间");
			resources_add_day.focus();
			return;
		}
		if(guest_name.value==""){
			alert("请输入客户姓名！");
			guest_name.focus();
			return;
		}
		if(guest_age.value=="" || guest_age.value<1){
			alert("请输入正确的客户年龄！");
			guest_age.focus();
			return;
		}
		if(isExistSpace(guest_name.value)){
			alert("客户姓名中不允许包含空格！");
			guest_name.select();
			return;
		}
		if(sheng.value==''){
            alert('请选择客户地区');
            return;
		}
		if(guest_address.value==""){
			alert("请输入客户收货地址！");
			guest_address.focus();
			return;
		}
		if(isExistSpace(guest_address.value)){
			alert("客户收货地址中不允许包含空格！");
			guest_address.select();
			return;
		}
//		if(guest_postcode.value==""){
//			alert("请输入客户邮编！");
//			return;
//		}
		if(/\D/.test(guest_postcode.value)){
			alert("邮编必须为数字！");
			guest_postcode.select();
			return;
		}
		var contactItems = $("ContactBlock").getElementsByTagName("input");
		for(var i=0;i<contactItems.length;i++){
			if(contactItems[i].type=="text"){
				if(isExistSpace(contactItems[i].value)){
					alert("客户联系方式中不允许包含空格！");
					contactItems[i].select();
					return;
				}
				if(contactItems[i].parentNode.getElementsByTagName('select')[0].value=='手机'){
                    if(contactItems[i].value!='' && !/^1[34578]\d{9}$/.test(contactItems[i].value)){
                        alert('手机号格式不正确！');
                        contactItems[i].select();
                        return;
                    }
				}
			}
		}

		if($('order_type_code1').checked){
			if(typeof(get_money_deal_code) == "object"){
				var reg=/淘宝|支付宝|爱来尚品|何氏|红色博士/g;
				if(reg.test($('bank_name').value)&&get_money_deal_code.value==""){
					alert("请填写到款交易号！");
					return;
				}
			 }

			var reg_bank=/淘宝|支付宝|爱来尚品|何氏|红色博士/g;

			if(!(reg_bank.test($('bank_name').value)) && $('bank_name').value.length!=0){
				if(!($('bank_money_date').value!='' && $('bank_money_hour').value!='' && $('bank_money_minute').value!='')){
					if(($('bank_money_date').value!='' && $('bank_money_hour').value!='') || $('bank_money_minute').value==''){
						alert('客户打款时间要精确到分！');
						return false;
					}else if(($('bank_money_date').value=='' && $('bank_money_hour').value=='') || $('bank_money_minute').value!=''){
						alert('客户打款时间格式不正确！');
						return false;
					}
				}

			}
		}

		if($('order_type_code0').checked&&parseInt($('reserve_money').value)>0){
			if(typeof(get_type0_money_deal_code) == "object"){
				var reg=/淘宝|支付宝|爱来尚品|何氏|红色博士/g;
				if(reg.test($('bank_name').value)&&get_type0_money_deal_code.value==""){
					alert("请填写到款交易号！");
					return;
				}
			 }
        }

		if($('order_type_code1').checked&&bank_name.value==""){
			alert("请选择财务查询帐号！");
			return;
		}
		if($('order_type_code0').checked&&bank_name.value==""&&parseInt($('reserve_money').value)>0){
			alert("请选择收款帐号！");
			return;
		}

		if(order_channel.value==""){
			alert("请选择订购渠道！");
			return;
		}

		if(organ.value==''){
			alert("请选择所属机构！");
			return;
		}

        if(wechat_id.value==''){
            alert("请选择微信！");
            return;
        }


        //判断产品库存
        var currentProduct = totalProduct();
        $('append_button').disabled = true;
        execute('get','get.php?c=check_stock&product_id='+currentProduct.id.join(',')+'&product_count='+currentProduct.count.join(','),function(string){
            var message = '';
            if(string!='ok'){
                if(string=='' || string==null){
                    message = '库存检测发生错误！';
				}else{
					try{
                    	eval('var result='+string);
						if(typeof(result)=='object'){
							for(var i=0;i<result.length;i++){
								if(currentProduct.data[result[i].id].count<1){
									message += currentProduct.data[result[i].id].name+' 发货数量['+currentProduct.data[result[i].id].count+']小于1\n\n';
								}else{
									message += currentProduct.data[result[i].id].name+' 剩余库存['+result[i].stock+'] 小于 发货数量['+currentProduct.data[result[i].id].count+']\n\n';
								}
							}
							if(message!='')message = '\n您所添加的产品中，数量有误或库存不足，具体详情如下：\n\n\n'+message;
						}else{
							message = result;
						}
					}catch(e){
						message = string;
					}
                }
            }
            if(message==''){
                action = "?c=append&method=post&guest_id=<?php echo $guest_id?>";
                method = "post";
                submit();
            }else{
                alert(message);
                $('append_button').disabled = false;
            }
        });

	}
}
function checkGuestInfo(){
	for(var i=0;i<6;i++)$('guest_info_tr_'+i).style.display = arguments[0];
}
function chooseType(n){
	$('reserve_money_row').style.display=(n)?"none":"";
	$('pay_money_row').style.display=(n)?"none":"";
	$('expect_pay_row').style.display="none";
	$("expect_time_row").style.display=(n)?"":"none";

	if(document.getElementById('is_super').value == 1 || document.getElementById('organ_info').value == '舒卫能'){
		if(n==1){
			var select_assign = document.getElementById("assign_express_id");
			var money_val = 6;
			for(var i=0; i<select_assign.options.length; i++){
				if(select_assign.options[i].value == money_val){
					select_assign.options[i].selected = true;
					break;
				}
			}

			select_assign.onfocus=function(){
				this.defaultIndex=this.selectedIndex;

			}
			select_assign.onchange=function(){
				this.selectedIndex=this.defaultIndex;

			}

		}else{
			var select_assign = document.getElementById("assign_express_id");
			select_assign.options[0].selected=true;
			select_assign.onchange=function(){
				this.selectedIndex=this.selectedIndex;

			}

		}
	}



}
function total(){
	var productPrice = product[$("product_id").selectedIndex];
	$("product_package_count").value = parseInt($("product_package_count").value);
	if($("product_package_count").value=="NaN")$("product_package_count").value = 0;
	var productCount = $("product_package_count").value;
	$("order_money").value = productPrice*productCount;
	if($("order_money").value=="NaN")$("order_money").value=0;
}

function totalProduct(){
    var inputList = $('gift_list').getElementsByTagName('input');
    var productData = [];
    var productIDArray = [];
    var productCountArray = [];
	var isHasSellProduct = false;
    for(var i=0;i<inputList.length;i+=5){
        if(productData[inputList[i+1].value]){
            productData[inputList[i+1].value].count += parseInt(inputList[i+3].value);
            productCountArray[productIDArray.indexOf(inputList[i+1].value)] += parseInt(inputList[i+3].value);
        }else{
            productData[inputList[i+1].value] = {
                'id'    :   inputList[i+1].value,
                'name'  :   inputList[i+2].value,
                'count' :   parseInt(inputList[i+3].value),
				'type'	:	inputList[i].value
            };
			if(inputList[i].value=='1')isHasSellProduct=true;
            productIDArray.push(inputList[i+1].value);
            productCountArray.push(parseInt(inputList[i+3].value));
        }
    }
    return {
        'data'  :   productData,
        'id'    :   productIDArray,
        'count' :   productCountArray,
		'isHasSellProduct'	:	isHasSellProduct
    }
}
function change_pay_money(){
	if(document.getElementById('order_money').value == '' || parseInt(document.getElementById('order_money').value)==0){
			alert("请先填写订单总金额");
			document.getElementById('reserve_money').value=0;
			return false;
	}
	if(parseInt(document.getElementById('order_money').value) <= parseInt(document.getElementById('reserve_money').value)){
			alert("订金金额大于等于订单总金额了");
			$('expect_pay_row').style.display="none";
			document.getElementById('reserve_money').value=0;
			document.getElementById('pay_money').value=document.getElementById('order_money').value;
			document.getElementById('order_type_code1').disabled=false;
			return false;

	}else if(parseInt(document.getElementById('order_money').value) > parseInt(document.getElementById('reserve_money').value) && parseInt(document.getElementById('reserve_money').value) > 0){
		document.getElementById('order_type_code1').disabled=true;
	}else{
		document.getElementById('order_type_code1').disabled=false;
	}

	javascript:document.getElementById('pay_money').value=parseInt(document.getElementById('order_money').value)-parseInt(document.getElementById('reserve_money').value);

}
function change_o_pay_money(){
	if(document.getElementById('reserve_money').value != 0){
		document.getElementById('pay_money').value=parseInt(document.getElementById('order_money').value)-parseInt(document.getElementById('reserve_money').value);
	}else{
		document.getElementById('reserve_money').value=0;
		document.getElementById('pay_money').value=document.getElementById('order_money').value;
	}
	if(document.getElementById('order_money').value == ''){
		document.getElementById('pay_money').value='';
	}

}
window.onload=function(){
		if(document.getElementById('order_type_code0').checked){
			$('reserve_money_row').style.display="";
			$('pay_money_row').style.display="";
		}

}
</script>
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">添加订单</td>
  </tr>
  <tr>
	<td style="padding:10px">
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单编号：</strong></td>
    <td width="84%" align="left"><input type="text" name="order_code" value="<?php echo get_order_code();?>" readonly="true" style="border-width:0" /></td>
  </tr>
  <tr bgcolor="#ffffff" style="display:none">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单名称：</strong></td>
    <td width="84%" align="left"><input type="text" name="order_name" /> (非必填项)</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单产品：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<input type="button" value="添加产品" onclick="createWindow()" style="height:35px;width:100px"/>　
		<div id="gift_list"></div>
		<div style="clear:both"></div>
		<div style="border:1px solid #ddd;background:#fcfcfc;padding:5px 10px;line-height:24px;margin-top:10px;color:#999">
			<strong>注意：</strong>添加产品时会有两种产品类型可供选择，主产品为实际销售的产品字体颜色标识为黑色，附属产品为不参与实际销售的产品字体颜色标识为灰色，当统计产品销售时系统会将订单的第一个主产品作为统计对象，其余的产品不做统计，请一定要按照正确的方式添加产品！
		</div>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品疗程数：</strong></td>
    <td width="84%" align="left"><input type="text" name="product_package_count" id="product_package_count" onkeyup="//total()" onblur="if(this.value>50){alert('产品疗程数值过大，请检查是否输入正确！');this.select()}" /></td>
  </tr>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单总金额：</strong></td>
    <td width="83%" align="left"><input type="text" name="order_money" id="order_money" autoComplete="off"  onkeyup="change_o_pay_money()" onblur="javascript:if((parseInt(document.getElementById('pay_money').value)<0 && document.getElementById('pay_money').value != '')){alert('代收款金额不能为负或者不能为空');document.getElementById('order_money').value='';return false;}"/><span style="color:red">(*此处一定要手动填写 不能粘贴)</span></td>
  </tr>
  <tr bgcolor="#ffffff" id="reserve_money_row" style="display:none">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订金金额：</strong></td>
    <td width="83%" align="left"><input type="text" name="reserve_money" id="reserve_money"  autoComplete="off" onkeyup="change_pay_money()" onblur="javascript:if(parseInt(this.value)>0 && parseInt(document.getElementById('reserve_money').value) < parseInt(document.getElementById('order_money').value)){document.getElementById('expect_pay_row').style.display=''}else{document.getElementById('expect_pay_row').style.display='none'}"/><span style="color:red">(*此处一定要手动填写 不能粘贴)</span></td>
  </tr>
  <tr bgcolor="#ffffff" id="pay_money_row" style="display:none">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>代收款金额：</strong></td>
    <td width="83%" align="left"><input type="text" name="pay_money" id="pay_money" readonly="readonly" /></td>
  </tr>
  <tr bgcolor="#ffffff" id="expect_pay_row" style="display:none">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收款账号：</strong></td>
    <td width="84%" align="left">
		收款帐号：<select onchange="var bank_array=this.value.split('|');$('bank_name').value=bank_array[0];$('bank_code').value=bank_array[1]">
		<option value="|">请选择查询帐号</option>
		<?php
			//$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1".get_check_organ_sql(173));
			//暂时不判断机构了
			$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1");
			foreach($banks as $bank){
				echo "<option value=\"".$bank[1]."|".$bank[2]."\">".$bank[0]." [".$bank[1]."：".$bank[2]."]</option>";
			}
		?>
		<option value="其他银行|其他帐号">其他帐号</option>
		</select>
		<div style="margin-top:5px" id="get_type0_money_deal_code">
            <div style="margin-top:5px" >
            到款交易号：<input name="get_type0_money_deal_code" type="text" value="" size="50" /> (必填*)
            </div>
        </div>
       </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>支付方式：</strong></td>
    <td width="84%" align="left">
		<input type="radio" name="order_type_code" value="0" id="order_type_code0" checked="checked" onclick="chooseType(0)" /><label for="order_type_code0">货到付款</label>
        <input type="radio" name="order_type_code" value="1" id="order_type_code1" onclick="chooseType(1)" /><label for="order_type_code1">款到发货</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff" id="expect_time_row" style="display:none">
    <td height="60" align="center" bgcolor="#f3f3f3"><strong>到款支付信息：</strong></td>
    <td width="84%" align="left">
		财务查询帐号：<select onchange="var bank_array=this.value.split('|');$('bank_name').value=bank_array[0];$('bank_code').value=bank_array[1];var re=/淘宝|支付宝|爱来尚品|何氏|红色博士/g;if(re.test(bank_array[0])){$('bank_money_time').style.display='none';$('get_money_deal_code').style.display='block'}else if(bank_array[0].length!=0){$('bank_money_time').style.display='block';$('get_money_deal_code').style.display='none'}else{$('bank_money_time').style.display='none';$('get_money_deal_code').style.display='none'}">
		<option value="|">请选择查询帐号</option>
		<?php
			//$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1".get_check_organ_sql(173));
			//暂时不判断机构了
			$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1");
			foreach($banks as $bank){
				echo "<option value=\"".$bank[1]."|".$bank[2]."\">".$bank[0]." [".$bank[1]."：".$bank[2]."]</option>";
			}
		?>
		<option value="其他银行|其他帐号">其他帐号</option>
		</select>
		<div style="margin-top:5px">
		预计到款时间：<input name="expect_time" type="text" value="<?php echo get_time("Y年n月j日G点i分")?>" size="20" />
		</div>
        <div style="margin-top:5px;display:none" id="bank_money_time">
            <div style="margin-top:5px" >
            客户打款时间：<input name="bank_money_date" type="text" id="bank_money_date" onclick="showCalendar('bank_money_date','%Y-%m-%d',false,false,'bank_money_date')" size="10" readonly="true"/>
			<script type="text/javascript">
                var hourOptions = '';
                var minuteOptions = '';
                for(var i=0;i<24;i++){
                    hourOptions += '<option value="'+i+'">'+i+'</option>';
                }
                for(var i=0;i<60;i++){
                    minuteOptions += '<option value="'+i+'">'+i+'</option>';
                }
            </script>
            <select name="bank_money_hour" id="bank_money_hour">
                <option value="">--</option>
                <script type="text/javascript">
                    document.write(hourOptions);
                </script>
            </select>点
            <select name="bank_money_minute" id="bank_money_minute">
                <option value="">--</option>
                <script type="text/javascript">
                    document.write(minuteOptions);
                </script>
            </select>分   (精确到分*)
            </div>
            <div style="margin-top:5px" >
            打款人户名：<input name="bank_money_account_name" type="text" value="" size="20" />
            </div>
        </div>
        <div style="margin-top:5px;display:none" id="get_money_deal_code">
            <div style="margin-top:5px" >
            到款交易号：<input name="get_money_deal_code" type="text" value="" size="20" /> (必填*)
            </div>
        </div>
		<input name="bank_name" id="bank_name" type="hidden" />
		<input name="bank_code" id="bank_code" type="hidden" />
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户信息资料：</strong></td>
    <td width="83%" align="left"><input type="radio" id="guest_info_0" name="guest_info" checked="checked" /><label for="guest_info_0">展开</label>　<input type="radio" id="guest_info_1" name="guest_info" /><label for="guest_info_1">关闭</label> (可以展开以确认或修改客户资料)</td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_0">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户资源添加时间：</strong></td>
    <td width="84%"  align="left">
    	<input name="resources_add_day" type="text" id="resources_add_day" onclick="showCalendar('resources_add_day','%Y-%m-%d',false,false,'resources_add_day')" size="10" readonly="true"/>(*必填)
    </td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_0">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="84%"  align="left"><input name="guest_name" type="text" value="<?php echo $guest_result[0]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_0">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户年龄：</strong></td>
    <td width="84%"  align="left"><input name="guest_age" type="text" value="<?php echo $guest_result[5]?>" />(*必填项)</td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_1">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户地区：</strong></td>
    <td width="84%" align="left">
		<script type="text/javascript" src="js/region.php"></script>
		<script type="text/javascript">chooseRegion("<?php echo $guest_result[1]?>")</script>
	</td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_2">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货地址：</strong></td>
    <td width="84%" align="left"><input name="guest_address" id="guest_address" type="text" size="50" value="<?php echo $guest_result[2]?>" />　<input type="button" value="插入地区" onclick="insertRegion('guest_address')" /></td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_3">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货邮编：</strong></td>
    <td width="84%" align="left"><input name="guest_postcode" type="text" value="<?php echo $guest_result[3]?>" maxlength="6" /></td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_4">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>联系方式：</strong></td>
    <td width="84%" align="left" id="ContactBlock">
	<div>
		<span id="ItemTemplate">
		<select name="contact_type[]">
		<?php
			$db = new db(true);
			$item_result = $db -> query("select item_name from contact");
			foreach($item_result as $item){
				echo "<option value=\"".$item[0]."\">".$item[0]."</option>";
			}
		?>
    	</select>
		<input name="contact_value[]" type="text" maxlength="30" />
		</span>
		<input type="button" value="添加新项" onclick="insertItem()" />
	</div>
	<?php
		echo "<script type=\"text/javascript\">";
		$contact_result = $db->query("select type,content from customercontact where id_Customer=".$guest_id);
		$contact_count = count($contact_result);
		if($contact_count>0){
			echo "var contact_type = $$$(\"select\",\"ItemTemplate\")[0];var contact_value = $$$(\"input\",\"ItemTemplate\")[0];for(var i=0;i<contact_type.length;i++){if(contact_type[i].value==\"".$contact_result[0][0]."\"){contact_type.selectedIndex=i;break}}contact_value.value=\"".$contact_result[0][1]."\";";
			for($i=1;$i<$contact_count;$i++){
			echo "insertItem();contact_type = $$$(\"select\",\"item\"+itemIndex)[0];contact_value = $$$(\"input\",\"item\"+itemIndex)[0];for(var i=0;i<contact_type.length;i++){if(contact_type[i].value==\"".$contact_result[$i][0]."\"){contact_type.selectedIndex=i;break}}contact_value.value=\"".$contact_result[$i][1]."\";";
			}
		}
		echo "</script>";
	?>
	</td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_5">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>更新客户资料：</strong></td>
    <td width="84%" align="left"><input type="checkbox" name="guest_update" id="guest_update" value="true" /><label for="guest_update">更新客户资料</label> (如果对客户资料做了修改，选中此项后，新的客户资料将被保存到客户表中)
	</td>
  </tr>
  <script type="text/javascript">
  	$('guest_info_0').onclick = function(){checkGuestInfo('')};
  	$('guest_info_1').onclick = function(){checkGuestInfo('none')};
  </script>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="84%" align="left">
		<select name="order_channel">
			<option value="">请选择订购渠道</option>
			<?php
			$order_channel_result = $db -> query("select id,name from order_channel where is_valid=1 order by order_index");
			if(!empty($order_channel_result)){
				foreach($order_channel_result as $order_channel_item){
					echo "<option value=\"".$order_channel_item[0]."|".$order_channel_item[1]."\">".$order_channel_item[1]."</option>";
				}
			}
			?>
		</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>指定快递公司：</strong></td>
    <td width="84%" align="left">
		<select name="assign_express_id" id="assign_express_id"  >
		<option value="0">选择要指定的快递公司</option>
		<?php
			$result = $db -> query('select id,express_name from express where is_valid=1'.get_check_organ_sql(172).' order by order_index');
			foreach($result as $key => $row){
				echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
			}
		?>
		</select>
	</td>
  </tr>
  <?php if($_SESSION['is_super'] || (get_organ_info('name')=='舒卫能')){ ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>活动标签：</strong></td>
    <td width="84%" align="left">
		<select name="active_tag_id" id="active_tag_id">
        	<option value="0">请选择</option>
            <?php $active_tag_data=$db->query("select * from active_tag where is_valid=1");
				foreach($active_tag_data as $a_data){
			?>
            	<option value="<?php echo $a_data['id'] ?>"><?php  echo $a_data['active_name'] ?></option>
			<?php
				}
			 ?>

        </select>
	</td>
  </tr>
  <?php } ?>

  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>关联前是否允许发货：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<input name="is_allow_send" type="radio" value="1" checked="checked" id="is_allow_send_1" /><label for="is_allow_send_1">允许</label>
        <input type="radio" name="is_allow_send" value="0" id="is_allow_send_0" onclick="if(!confirm('不允许发货的订单发货部将看不到，如果没有关联需求请谨慎操作！\n\n确定不允许发货吗？'))$('is_allow_send_1').checked=true;" />暂不允许
		<div style="color:#ccc;margin-top:10px;line-height:20px">[在有关联订单需求时，为了防止已经添加的订单在未关联之前被发货，此时这个选项非常有用，在设置关联之后，系统将自动设置为允许发货，无关联需求请取默认值(允许)即可，不允许发货的订单发货部是看不到的，为了不影响发货，请慎重选择！！！！]</div>
	</td>
  </tr>
  <tr bgcolor="#ffffff" style="display:none">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发布类型：</strong></td>
    <td width="84%" align="left">
		<input name="publish_type" type="radio" value="0" checked="checked" id="publish_type_0" /><label for="publish_type_0">正式发布</label>
        <input type="radio" name="publish_type" value="1" disabled="disabled" id="publish_type_1" /><label for="publish_type_1">存草稿箱</label>
	</td>
  </tr>

  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="84%" align="left">
		<?php
			organ_select(171,$guest_result['organ_id']);
		?>
		<span style="color:#ccc">[默认选中客户所属机构]</span>
	</td>
  </tr>

    <tr bgcolor="#ffffff">
        <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>所属微信：</strong></td>
        <td width="84%" align="left">
            <select name="wechat_id" id="wechat_id">
                <?php foreach($wx_result as $value){?>
                    <option value="<?php echo $value['id'];?>"><?php echo $value['no'];?></option>
                <?php }?>
            </select>
            <span style="color:#ccc">[只能选择当前登录用户名下微信]</span>
        </td>
    </tr>

<tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单备注：</strong></td>
    <td width="84%" align="left"><textarea name="order_intro" cols="60" style="height:80px;margin:5px 0;font-size:13px;overflow:auto"></textarea></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="hidden" id="is_super" value="<?php echo $_SESSION['is_super']; ?>">
    	<input type="hidden" id="organ_info" value="<?php echo get_organ_info('name'); ?>">
		<input type="button" value=" 添 加 " onclick="checkForm()" id="append_button" style="width:90px;height:35px;margin-right:40px" />
		<input type="reset" value=" 清 除 " style="width:90px;height:35px" />
	</td>
  </tr>
</table>
	</td>
  </tr>
</table>
</form>
<?php
}

function amend(){
	check_user(46);
	global $db;
	$db = new db(true);
	$order_id = $_GET["order_id"];
//	$is_amend = false;
    $src_list = $_GET['src_list'];

	if(!isset($order_id))$order_id=get_selected(false,1);
	include_once("include/guide.php");
	$guide = new guide();
	$order = $order_result = $db -> query("select order_code,order_name,product_package_count,order_money,guest_id,guest_name,guest_region_code,guest_address,guest_postcode,guest_contact,order_type_code,money_expect_time,money_bank_name,money_bank_code,order_state_code,order_intro,is_finished,product_unit_count,addition_id,organ_id,is_sent,is_valid,order_channel_id,order_channel_name,is_allow_send,assign_express_id,product_id,reserve_money,pay_money,resources_add_day,active_tag_id,guest_age,wechat_id from orderform where id=".$order_id,true);
//	if((($order_result[11]==0&&$order_result[15]==300)||($order_result[11]==1&&$order_result[15]==200)||$order_result[15]==100)){
//		$is_amend = true;
//	}

    //如果已发货，判断修改权限
    //是否允许修改已发货
    if($order_result[20]||$order_result[14]==400){
        if(check_function(182)){
        	$is_amend_sended = true;
		}else{
        	$is_amend_sended = false;
		}
    }else{
        $is_amend_sended = true;
    }

	//$is_amend_sended = false;

    //已删除的不能修改
    if(!$order_result[21]){
        $guide -> set_message("已删除的订单不允许修改！",true);
        $guide -> append("订单列表","?".get_common_param());
        $guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id);
        $guide -> out();
    }

	$guest_id = $order_result[4];
	$update_item_array = array();
	if($_GET["method"]=="post"){


        $src_list_param = '&src_list='.$src_list;
        $src_list = encode($src_list,FALSE);

//		if($is_amend){
			$update_values = array();
			$product_delete_logs = array();
			$product_insert_logs = array();
			$guest_update_logs = array();
			$guest_contact_delete_logs = array();
			$guest_contact_insert_logs = array();

			$active_tag_id = $_POST["active_tag_id"] ? $_POST["active_tag_id"] : 0;
			array_push($update_item_array,"active_tag_id='".$active_tag_id."'");
			$update_values['active_tag_id'] = $active_tag_id;

			$order_code = $_POST["order_code"];
			array_push($update_item_array,"order_code='".$order_code."'");
			$update_values['order_code'] = $order_code;

			$order_name = $_POST["order_name"];
			array_push($update_item_array,"order_name='".$order_name."'");
			$update_values['order_name'] = $order_name;

			$resources_add_day=$_POST['resources_add_day'] ? strtotime($_POST['resources_add_day']) : '';
			array_push($update_item_array,"resources_add_day='".$resources_add_day."'");
			$update_values['order_name'] = $resources_add_day;

			//$product_id = $_POST["product_id"];
			//array_push($update_item_array,"product_id=".$product_id);
			//$product_result = $db -> query("select name,package_price from product where id=".$product_id,true);
			//$product_name = $product_result[0];
			//array_push($update_item_array,"product_name='".$product_name."'");
			//$product_package_price = $product_result[1];
			//array_push($update_item_array,"product_package_price=".$product_package_price);


			//如果允许修改已发货的订单信息
			if($is_amend_sended){


				$product_package_count = $_POST["product_package_count"];
				array_push($update_item_array,"product_package_count=".$product_package_count);
				$update_values['product_package_count'] = $product_package_count;

				//$product_unit_count = $_POST["product_unit_count"];
				//array_push($update_item_array,"product_unit_count=".$product_unit_count);
				$order_money = $_POST["order_money"];
				$reserve_money = $_POST["reserve_money"]?$_POST["reserve_money"]:0;
				$pay_money = $_POST["pay_money"]?$_POST["pay_money"]:$_POST["order_money"];
				array_push($update_item_array,"order_money=".$order_money);
				array_push($update_item_array,"reserve_money=".$reserve_money);
				array_push($update_item_array,"pay_money=".$pay_money);
				$update_values['order_money'] = $order_money;
				$update_values['reserve_money'] = $reserve_money;
				$update_values['pay_money'] = $pay_money;

				$guest_name = $_POST["guest_name"];
				array_push($update_item_array,"guest_name='".$guest_name."'");
				$update_values['guest_name'] = $guest_name;

				$guest_age = intval($_POST["guest_age"]);
				array_push($update_item_array,"guest_age='".$guest_age."'");
				$update_values['guest_age'] = $guest_age;

				if($guest_age){
					$now_year=date("Y");
					$birth_year=intval($now_year-$guest_age);
					$db->update('customer',array('guest_age'=>$guest_age,'birth_year'=>$birth_year),$guest_id);
				}



				$region = $guest_region = get_region();
				array_push($update_item_array,"guest_region_code='".$guest_region[0]."'");
				array_push($update_item_array,"guest_region_name='".$guest_region[1]."'");
				array_push($update_item_array,"guest_region_province_code={$region[2][0]}");
				array_push($update_item_array,"guest_region_city_code={$region[2][1]}");
				array_push($update_item_array,"guest_region_district_code={$region[2][2]}");
				$update_values['guest_region_code'] = $guest_region[0];
				$update_values['guest_region_name'] = $guest_region[1];
				$update_values['guest_region_province_code'] = $region[2][0];
				$update_values['guest_region_city_code'] = $region[2][1];
				$update_values['guest_region_district_code'] = $region[2][1];

				$guest_address = $_POST["guest_address"];
				array_push($update_item_array,"guest_address='".$guest_address."'");
				$update_values['guest_address'] = $guest_address;

				$guest_postcode = $_POST["guest_postcode"];
				array_push($update_item_array,"guest_postcode='".$guest_postcode."'");
				$update_values['guest_postcode'] = $guest_postcode;

				foreach($_POST["contact_value"] as $key => $value){

					if($value){
						$guest_contact .= $_POST["contact_type"][$key]."：".$value;
						if($key<count($_POST["contact_value"])-1){
							$guest_contact .= "<br />";
						}
					}
				}
				if(isset($guest_contact)){
					array_push($update_item_array,"guest_contact='".$guest_contact."'");
					$update_values['guest_contact'] = $guest_contact;
				}


				$guest_update = $_POST["guest_update"];
				if($guest_update){
					$time = get_time();
					$db -> execute("update customer set name='".$guest_name."',diqu_code='".$guest_region[0]."',diqu_name='".$guest_region[1]."',guest_region_province_code={$region[2][0]},guest_region_city_code={$region[2][1]},guest_region_district_code={$region[2][2]},address='".$guest_address."',post='".$guest_postcode."' where id=".$guest_id);
					//将修改客户的数据加入到更新日志
					$guest_update_logs = array(
						'data'	=>	array(
							'name'							=>		$guest_name,
							'age'							=>      $guest_age,
							'region_code'					=>		$guest_region[0],
							'region_name'					=>		$guest_region[1],
							'guest_region_province_code'	=>		$region[2][0],
							'guest_region_city_code'		=>		$region[2][1],
							'guest_region_district_code'	=>		$region[2][2],
							'address'						=>		$guest_address,
						),
						'where'	=>	array(
							'guest_id'	=>	$guest_id,
						),
					);

					$db -> execute("delete from customercontact where id_Customer=".$guest_id);
					//将删除联系方式的数据加入到更新日志
					$guest_contact_delete_logs=array(
						'guest_id'	=>	$guest_id,
					);

					foreach($_POST["contact_value"] as $key => $value){
						if($value){
							$db -> execute("insert into customercontact(type,content,id_Customer,name_Customer,time_Add) values('".$_POST["contact_type"][$key]."','".$value."',".$guest_id.",'".$_POST["guest_name"]."','".$time."')");

							//将添加联系方式的数据加入到更新日志
							$guest_contact_insert_logs[] = array(
								'guest_id'			=>		$guest_id,
								'guest_name'		=>		$_POST["guest_name"],
								'type'				=>		$_POST["contact_type"][$key],
								'content'			=>		$value,
								'add_time'			=>		$time,
							);

						}
					}
				}

				$publish_type = $_POST["publish_type"];
				if(isset($publish_type)){
					$order_type_code = $_POST["order_type_code"];
					$order_type_name = ($order_type_code==0)?"货到付款":"款到发货";
					array_push($update_item_array,"order_type_code=".$order_type_code);
					$update_values['order_type_code'] = $order_type_code;

					array_push($update_item_array,"order_type_name='".$order_type_name."'");
					$update_values['order_type_name'] = $order_type_name;

					if($publish_type==1){
						$order_state_code = "100";
						$order_state_name = "尚未发布的草稿";
					}else{
						if($order_type_code==0){
							$order_state_code = "300";
							$order_state_name = "等待发货部处理发货";
						}else{
							$order_state_code = "200";
							$order_state_name = "等待财务部确认到款";
						}
					}
					array_push($update_item_array,"order_state_code=".$order_state_code);
					array_push($update_item_array,"order_state_name='".$order_state_name."'");
					$update_values['order_state_code'] = $order_state_code;
					$update_values['order_state_name'] = $order_state_name;

					if($order_type_code==1){
						$expect_time = $_POST["expect_time"];
						$bank_name = $_POST["bank_name"];
						$bank_code = $_POST["bank_code"];
						array_push($update_item_array,"money_expect_time='".$expect_time."'");
						array_push($update_item_array,"money_bank_name='".$bank_name."'");
						array_push($update_item_array,"money_bank_code='".$bank_code."'");
						$update_values['money_expect_time'] = $expect_time;
						$update_values['money_bank_name'] = $bank_name;
						$update_values['money_bank_code'] = $bank_code;
					}elseif($order_type_code==0){
						$bank_name = $_POST["bank_name"];
						$bank_code = $_POST["bank_code"];
						array_push($update_item_array,"money_bank_name='".$bank_name."'");
						array_push($update_item_array,"money_bank_code='".$bank_code."'");
						$update_values['money_bank_name'] = $bank_name;
						$update_values['money_bank_code'] = $bank_code;

					}
				}else{
					if($order_result[10]==1){
						$expect_time = $_POST["expect_time"];
						$bank_name = $_POST["bank_name"];
						$bank_code = $_POST["bank_code"];
						array_push($update_item_array,"money_expect_time='".$expect_time."'");
						array_push($update_item_array,"money_bank_name='".$bank_name."'");
						array_push($update_item_array,"money_bank_code='".$bank_code."'");
						$update_values['money_expect_time'] = $expect_time;
						$update_values['money_bank_name'] = $bank_name;
						$update_values['money_bank_code'] = $bank_code;

					}elseif($order_result[10]==0){
						$bank_name = $_POST["bank_name"];
						$bank_code = $_POST["bank_code"];
						array_push($update_item_array,"money_bank_name='".$bank_name."'");
						array_push($update_item_array,"money_bank_code='".$bank_code."'");
						$update_values['money_bank_name'] = $bank_name;
						$update_values['money_bank_code'] = $bank_code;

					}
				}


				$assign_express_id = $_POST['assign_express_id'];
				if(!is_numeric($assign_express_id))$assign_express_id=0;
				if($assign_express_id){
					$assign_express_name = $db->query('select express_name from express where id='.$assign_express_id,true,true);
				}
				array_push($update_item_array,"assign_express_id=".$assign_express_id);
				array_push($update_item_array,"assign_express_name='".$assign_express_name."'");
				$update_values['assign_express_id'] = $assign_express_id;
				$update_values['assign_express_name'] = $assign_express_name;

				//是否允许发货
				$is_allow_send = $_POST['is_allow_send'];
				array_push($update_item_array,"is_allow_send=".$is_allow_send);

			}


			$order_channel = $_POST['order_channel'];
			if(strpos($order_channel,"|")>0){
				$order_channel_array = explode("|",$order_channel);
				$order_channel_id = $order_channel_array[0];
				$order_channel_name = $order_channel_array[1];
			}else{
				$order_channel_id = 0;
				$order_channel_name = '';
			}
			array_push($update_item_array,"order_channel_id=".$order_channel_id);
			array_push($update_item_array,"order_channel_name='".$order_channel_name."'");
			$update_values['order_channel_id'] = $order_channel_id;
			$update_values['order_channel_name'] = $order_channel_name;
//		}

		$organ_id = $_POST['organ'];
		//if(empty($organ_id))$organ_id=$_SESSION['organ_id'];
		if(!empty($organ_id)){
			array_push($update_item_array,"organ_id=".$organ_id);
		}
        if(isset($_POST['wechat_id'])){
            $update_values['wechat_id'] = intval($_POST['wechat_id']);
            array_push($update_item_array,"wechat_id=". $update_values['wechat_id']);

        }

		$add_person = $_POST["add_person"];
		if(isset($add_person)){
			$user = $db -> query("select name,mobile,phone from user where id=".$add_person,true);
			$user_name = $user[0];
			if($user[1]!=""){
				$user_phone = "手机：".$user[1]."<br />";
			}
			if($user[2]!=""){
				$user_phone .= "座机：".$user[2];
			}
			array_push($update_item_array,"addition_id=".$add_person);
			array_push($update_item_array,"addition_name='".$user_name."'");
			array_push($update_item_array,"addition_phone='".$user_phone."'");
			$update_values['addition_id'] = $add_person;
			$update_values['addition_name'] = $user_name;
			$update_values['addition_phone'] = $user_phone;
		}
		$is_back_state = $_POST["is_back_state"];
		if($is_back_state){
			if($order_result[14]==700){
				array_push($update_item_array,"order_state_code=500");
				array_push($update_item_array,"order_state_name='等待发货部确认收到退货'");
				array_push($update_item_array,"return_finance_id=money_manager_id");
				array_push($update_item_array,"return_finance_name=money_manager_name");
				array_push($update_item_array,"return_finance_time=money_fact_time");
				array_push($update_item_array,"money_manager_id=null");
				array_push($update_item_array,"money_manager_name=null");
				array_push($update_item_array,"money_fact_time=null");
				array_push($update_item_array,"money_fact_count=null");

				$update_values['order_state_code'] = '500';
				$update_values['order_state_name'] = '等待发货部确认收到退货';

			}else{
				array_push($update_item_array,"order_state_code=700");
				array_push($update_item_array,"order_state_name='已完成'");
				array_push($update_item_array,"money_manager_id=return_finance_id");
				array_push($update_item_array,"money_manager_name=return_finance_name");
				array_push($update_item_array,"money_fact_time=return_finance_time");
				array_push($update_item_array,"money_fact_count=order_money");
				array_push($update_item_array,"return_finance_id=null");
				array_push($update_item_array,"return_finance_name=null");
				array_push($update_item_array,"return_finance_time=null");
				array_push($update_item_array,"return_reason=null");
				if($order_result[14]==600){
					array_push($update_item_array,"return_sender_id=null");
					array_push($update_item_array,"return_sender_name=null");
					array_push($update_item_array,"return_sender_time=null");
				}
				$update_values['order_state_code'] = '700';
				$update_values['order_state_name'] = '已完成';
			}
		}


		$order_intro = $_POST["order_intro"];

		$order_logs = '<div class="intro_title">['.$_SESSION["user_name"].']于['.get_time().']修改了订单</div>';
		if(!empty($order_intro)){
			$order_logs .= '<div class="intro_content">'.$order_intro.'</div>';
			$order_logs = addslashes($order_logs);
			$order_intro = stripslashes($order_result[15]).'<br />'.'['.$_SESSION["user_name"].']'.$order_intro;
			$order_intro = addslashes($order_intro);
			array_push($update_item_array,"order_intro='".$order_intro."'");
		}
		array_push($update_item_array,"order_logs='".$order_logs."'");


		$is_error = false;

		//如果允许修改已发货订单信息，则执行一系列
		if($is_amend_sended){

			//进行库存判断
			$gift_product_id = (array)$_POST["gift_product_id"];
			$gift_product_name = $_POST["gift_product_name"];
			$gift_product_count = $_POST["gift_product_count"];
			$gift_product_money = $_POST["gift_product_money"];
			$gift_product_type = $_POST["gift_product_type"];

			$product_name = array();

			//拼合产品数据，相同产品累加库存
			$product_data = array();
			foreach($gift_product_id as $key => $value){
				if(empty($product_data[$value])){
					$product_data[$value] = array(
						'id' => $value,
						'name' => $gift_product_name[$key],
						'count' => $gift_product_count[$key],
					);
				}else{
					$product_data[$value]['count'] += $gift_product_count[$key];
				}
			}

			//目前剩余库存
			$stock_result = $db->query('select id,stock_count,name from product where id in('.implode(',',$gift_product_id).')','assoc');
			$stock = array();
			foreach($stock_result as $row){
				$stock[$row['id']] = $row['stock_count'];
				$product_name[$row['id']] = $row['name'];
			}

			//目前订单所占用的库存加上剩余库存，是总共的库存，拿这个总的库存去判断是否足够发货
			$gift_result = $db->query('select product_id,sum(product_count) as product_count,product_name from gift where order_id='.$order_id.' group by product_id','assoc');
			$gift_stock = array();
			foreach($gift_result as $gift){
				if(is_numeric($stock[$gift['product_id']]))$stock[$gift['product_id']] += $gift['product_count'];
				$gift_stock[$gift['product_id']] = $gift['product_count'];
				$product_name[$gift['product_id']] = $gift['product_name'];
			}

			//新提交的产品数量
			$product_count = array();
			//检测库存不足的产品
			foreach($product_data as $product){
				if($stock[$product['id']]<$product['count']){
					$message .= $product['name'].' 剩余库存['.$stock[$product['id']].'] 小于 发货数量['.$product['count'].']<br />';
				}
				$product_count[$product['id']] = $product['count'];
			}

			//如果没有库存不足的产品，继续修改
			if(empty($message)){

				//取出第一个不是赠品的产品做为主产品
				foreach($gift_product_id as $key => $value){
					if($gift_product_type[$key]==1){
						$main_product_id = $value;
						$main_product_name = $gift_product_name[$key];
						break;
					}
				}

				//如果没有找到，说明订单内全部是赠品，那么就取第一个赠品作为主产品
				if(!$main_product_id){
					$main_product_id = $gift_product_id[0];
					$main_product_name = $gift_product_name[0];
				}


				//如果主产品有变动
				if($order['product_id']!=$main_product_id){
					array_push($update_item_array,"product_id=$main_product_id");
					array_push($update_item_array,"product_name='$main_product_name'");
					$update_values['product_id'] = $main_product_id;
					$update_values['product_name'] = $main_product_name;

					$phase_package = 0;
					//取出产品的阶段参数
					$phase_sql = 'select phase_list from product_phase where product_id='.$main_product_id.' and package=';
					for($i=$product_package_count;$i>0;$i--){
						$phase_list = $db->query($phase_sql.$i,true,true);
						if(!empty($phase_list)){
							$phase_package = $i;
							break;
						}
					}

					$phase_count = !empty($phase_list)?count(explode(' ',$phase_list)):0;
					$phase_count++;

					array_push($update_item_array,"phase_list='$phase_list'");
					array_push($update_item_array,"phase_count=$phase_count");
					array_push($update_item_array,"phase_package=$phase_package");
				}

				$db -> execute("delete from gift where order_id=".$order_id);
				//将删除产品的数据加入到更新日志
				$product_delete_logs = array(
					'order_id'		=>	$order_id,
				);

				foreach($gift_product_id as $key => $value){
					$db -> execute("insert into gift(order_id,product_id,product_name,product_count,gift_money,gift_type) values(".$order_id.",".$value.",'".$gift_product_name[$key]."',".$gift_product_count[$key].",'".$gift_product_money[$key]."',".$gift_product_type[$key].")");
					//将添加订单产品的数据加入到更新日志
					$product_insert_logs[] = array(
						'order_id'			=>		$order_id,
						'product_id'		=>		$value,
						'product_name'		=>		$gift_product_name[$key],
						'product_count'		=>		$gift_product_count[$key],
						'gift_money'		=>		$gift_product_money[$key],
						'gift_type'			=>		$gift_product_type[$key],
					);

				}

				//计算并修改库存，需要改动的库存应该是，订单当前的产品数量和改动后的产品数量之间产生的数据差，正数是加负数是减
				//新产品是要减的库存，老产品是要加的库存，所以整合一下数据，可以减少不必要的数据库操作

				//遍历新产品,计算需要减的库存数
				foreach($product_count as $id => &$count){
					//如果老产品中存在新产品，那么新产品库存减去老产品库存,并把老库存产品信息删除掉
					if($gift_stock[$id]){
						$count -= $gift_stock[$id];
						//删掉老产品的记录
						unset($gift_stock[$id]);
					}
				}
				unset($count);

				//遍历余下的老产品库存取负，加入到新产品列表中去
				foreach($gift_stock as $id => $count){
					$product_count[$id] = -$count;
				}
				unset($count);

				//得到最终要设置的库存，正数是要减去的库存，负数是要返还的库存
				//然后遍历设置库存
				foreach($product_count as $id => $count){
					$product = $product_data[$id];
					if($count!=0){
						$db->execute('update product set stock_count=stock_count'.($count>0?'-':'+').abs($count).' where id='.$id);

						$organ_id = $db->query("select c.organ_id from product as p,product_class as c where p.id=".$id." and p.class_id=c.id",true,true);
						//出库
						if($count>0){
							//写出库单
							$db->insert('outputrecord',array(
								'type'			=>	2,
								'product_id'	=>	$id,
								'product_name'	=>	$product_name[$id],
								'unit_count'	=>	abs($count),
								'output_time'	=>	get_time(),
								'person_id'		=>	$_SESSION['user_id'],
								'person_name'	=>	$_SESSION['user_name'],
								'state'			=>	1,
								'order_id'		=>	$order_id,
								'organ_id'		=>	$organ_id,
							));
						//入库
						}else{
							//写入库单
							$db->insert('inputrecord',array(
								'type'			=>	1,
								'product_id'	=>	$id,
								'product_name'	=>	$product_name[$id],
								'unit_count'	=>	abs($count),
								'input_time'	=>	get_time(),
								'person_id'		=>	$_SESSION['user_id'],
								'person_name'	=>	$_SESSION['user_name'],
								'state'			=>	1,
								'order_id'		=>	$order_id,
								'organ_id'		=>	$organ_id,
							));
						}

					}
				}

				//清除缺货缓存
				clear_cache('oos_product',true);

				//清除产品销售数据缓存
				clear_cache('product_sell_data',true);

				$is_error = false;

			}else{

				$is_error = true;

			}

		}


		//记录更新数据的日志数组
		$data_update_logs_array = array();

		//将修改订单的数据加入到更新日志
		$data_update_logs_array['update_orderform'] = array(
			'data'	=>	$update_values,
			'where'	=>	array(
				'order_id'	=>	$order_id
			),
		);

		$data_update_logs_array['delete_gift'] = $product_delete_logs;
		$data_update_logs_array['insert_gift'] = $product_insert_logs;
		if($guest_update){
			$data_update_logs_array['update_guest'] = $guest_update_logs;
			$data_update_logs_array['delete_guest_contact'] = $guest_contact_delete_logs;
			$data_update_logs_array['insert_guest_contact'] = $guest_contact_insert_logs;
		}

		//将更新数据写入到日志文件中
		append_update_logs('amend_order',$data_update_logs_array);


		if(!$is_error){
			if(count($update_item_array)>0){
				$sql = "update orderform set ".implode(",",$update_item_array)." where id=".$order_id;
				$db -> execute($sql);
				append_log(5,'修改订单',$sql);
			}
			$guide -> set_message("订单修改成功！");
			$guide -> append("订单列表",$src_list);
			$guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id.$src_list_param);
			$guide -> append("继续修改订单","order.php?c=amend&order_id=".$order_id.$src_list_param);
		}else{
			$guide -> set_message("您修改的订单中的产品，部分产品剩余库存不足，具体详情如下：",true);
			$guide -> set_intro($message);
			$guide -> append("返回上一页修改订单","order.php?c=amend&order_id=".$order_id.$src_list_param);
			$guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id.$src_list_param);
			$guide -> append("订单列表",$src_list);
		}

		$guide -> out();
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/product.php?auto=false"></script>
<script type="text/javascript" src="js/append_product.js"></script>
<script type="text/javascript" src="js/guide.js"></script>
<script type="text/javascript" src="js/window.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
var itemIndex = 0;
function checkForm(){
	with(document.forms[0]){
<?php
//	if($is_amend){
?>
		if(order_code.value==""){
			alert("订单编号不能为空！");
			order_code.focus();
			return;
		}
		if(isExistSpace(order_name.value)){
			alert("订单名称中不允许包含空格！");
			order_name.select();
			return;
		}
		if($("gift_list").childNodes.length==0){
			alert("请添加产品！");
			return;
		}
		if(product_package_count.value==""){
			alert("请输入产品疗程数量！");
			product_package_count.focus();
			return;
		}
		if(/\D/.test(product_package_count.value)){
			alert("产品疗程数量必须为数字！");
			product_package_count.select();
			return;
		}
//		if(product_unit_count.value==""){
//			alert("请输入产品总盒数！");
//			return;
//		}
//		if(/\D/.test(product_unit_count.value)){
//			alert("总盒数必须为数字！");
//			return;
//		}
		if(!/^\d+(\.\d{1})?$/.test(order_money.value)){
			alert("订单金额必须为整数或者一位小数！");
			order_money.select();
			return;
		}
		if(guest_name.value==""){
			alert("请输入客户姓名！");
			guest_name.focus();
			return;
		}
		if(guest_age.value==""){
			alert("请输入客户年龄！");
			guest_age.focus();
			return;
		}
		if(isExistSpace(guest_name.value)){
			alert("客户姓名中不允许包含空格！");
			guest_name.select();
			return;
		}
		if(sheng.value==''){
            alert('请选择客户地区');
            return;
		}
		if(guest_address.value==""){
			alert("请输入客户收货地址！");
			guest_address.focus();
			return;
		}
		if(isExistSpace(guest_address.value)){
			alert("客户收货地址中不允许包含空格！");
			guest_address.select();
			return;
		}
//		if(guest_postcode.value==""){
//			alert("请输入客户邮编！");
//			return;
//		}
		if(/\D/.test(guest_postcode.value)){
			alert("邮编必须为数字！");
			guest_postcode.select();
			return;
		}
		var contactItems = $("ContactBlock").getElementsByTagName("input");
		for(var i=0;i<contactItems.length;i++){
			if(contactItems[i].type=="text"){
				if(isExistSpace(contactItems[i].value)){
					alert("客户联系方式中不允许包含空格！");
					contactItems[i].select();
					return;
				}
				if(contactItems[i].parentNode.getElementsByTagName('select')[0].value=='手机'){
                    if(contactItems[i].value!='' && !/^1[34578]\d{9}$/.test(contactItems[i].value)){
                        alert('手机号格式不正确！');
                        contactItems[i].select();
                        return;
                    }
				}
			}
		}
		<?php
			if($order_result[10]==1){
		?>
		if(bank_name.value==""){
			alert("请选择财务查询帐号！");
			return;
		}


<?php
		}
//	}
?>
		if(order_channel.value==""){
			alert("请选择订购渠道！");
			return;
		}

		if(organ.value==''){
			alert("请选择所属机构！");
			return;
		}
<?php
	if(check_function(177)){
?>
		if(add_person.value==""){
			alert("请选择客服人员！");
			return;
		}
        if(wechat_id.value==""){
            alert("请选择所属微信！");
            return;
        }
<?php
	}
?>

        //判断产品库存
        var currentProduct = totalProduct();

        $('amend_button').disabled = true;
        execute('get','get.php?c=check_stock&product_id='+currentProduct.id.join(',')+'&product_count='+currentProduct.count.join(',')+'&order_id=<?php echo $order_id?>',function(string){
            var message = '';
            if(string!='ok'){
                if(string=='' || string==null){
                    message = '库存检测发生错误！';
                }else{
					try{
                    	eval('var result='+string);
						if(typeof(result)=='object'){
							for(var i=0;i<result.length;i++){
								message += currentProduct.data[result[i].id].name+' 剩余库存['+result[i].stock+'] 小于 发货数量['+currentProduct.data[result[i].id].count+']\n\n';
							}
							if(message!='')message = '\n您所添加的产品中，部分产品剩余库存不足，具体详情如下：\n\n\n'+message;
						}else{
							message = result;
						}
					}catch(e){
						message = string;
					}
                }
            }
            if(message==''){

                var isSubmit;
                var isSent = <?php echo ($order_result[20]||$order_result[14]==400)?'true':'false'?>;
                var backStock = getBackStock(oldProduct,currentProduct);

                //订单已发货并且存在返还库存的产品
                if(isSent && backStock.length){

                    var message = '严重 警告！！！！！请认真阅读下面的说明并按提示谨慎操作！\n\n\n该订单是【发货中】或【已发货】的状态，由于您改动了订单的产品，并且本次产品的改动，造成某些货物需要返还库存，这需要您核实一下该订单的货物是不是可追回的！\n\n1.如果是可追回的(快递还没取走)，那么如果您确定要修改订单的话，您可以点击确定按钮修改订单，然后把返还的货物放回仓库！\n2.如果是不可追回的(快递已经取走)，由于没有办法将货物立即退回仓库，所以请不要点击确定按钮，不要保存并修改订单，以免造成库存混乱，这种情况的订单，请走退货流程，等待收到退货！！\n\n具体返还库存的数据如下：\n\n';

                    for(var i=0;i<backStock.length;i++){
                        message += backStock[i].name+' 返还库存：'+backStock[i].count+'\n';
                    }

                    isSubmit = window.confirm(message);

                }else{
                    isSubmit = true;
                }

                if(isSubmit){
                    action = "?c=amend&method=post&order_id=<?php
                    echo $order_id;
                    //没有传递来源列表页
                    if(empty($src_list)){
                        echo '&src_list='.encode($_SERVER['HTTP_REFERER']);
                    //来自列表
                    }else{
                        echo '&src_list='.$src_list;
                    }

                    ?>";
                    method = "post";
                    submit();
                }else{
                    $('amend_button').disabled = false;
                }

            }else{
                alert(message);
                $('amend_button').disabled = false;
            }
        });

	}
}
function chooseType(n){
	$("expect_time_row").style.display=(n)?"":"none";
}
function total(){
	var productPrice = product[$("product_id").selectedIndex];
	$("product_package_count").value = parseInt($("product_package_count").value);
	if($("product_package_count").value=="NaN")$("product_package_count").value = 0;
	var productCount = $("product_package_count").value;
	$("order_money").value = productPrice*productCount;
	if($("order_money").value=="NaN")$("order_money").value=0;
}

function totalProduct(){
    var inputList = $('gift_list').getElementsByTagName('input');
    var productData = [];
    var productIDArray = [];
    var productCountArray = [];
    for(var i=0;i<inputList.length;i+=5){
        if(productData[inputList[i+1].value]){
            productData[inputList[i+1].value].count += parseInt(inputList[i+3].value);
            productCountArray[productIDArray.indexOf(inputList[i+1].value)] += parseInt(inputList[i+3].value);
        }else{
            productData[inputList[i+1].value] = {
                'id'    :   inputList[i+1].value,
                'name'  :   inputList[i+2].value,
                'count' :   parseInt(inputList[i+3].value)
            };
            productIDArray.push(inputList[i+1].value);
            productCountArray.push(parseInt(inputList[i+3].value));
        }
    }
    return {
        'data'  :   productData,
        'id'    :   productIDArray,
        'count' :   productCountArray
    }
}

function getBackStock(oldProduct,currentProduct){
    var backStock = [];
    for(var i=0;i<oldProduct.id.length;i++){
        //判断是否有需要返还库存的产品
        var oldCount = oldProduct.data[oldProduct.id[i]].count;
        var currentCount = currentProduct.data[oldProduct.id[i]]?currentProduct.data[oldProduct.id[i]].count:0;
        var differ = oldCount-currentCount;
        if(differ>0)backStock.push({
            'id'    :   oldProduct.id[i],
            'name'  :   oldProduct.data[oldProduct.id[i]].name,
            'count' :   differ
        });
    }
    return backStock;
}

function change_pay_money(){
	if(document.getElementById('order_money').value == '' || parseInt(document.getElementById('order_money').value)==0){
			alert("请先填写订单总金额");
			document.getElementById('reserve_money').value=0;
			return false;
	}
	if(parseInt(document.getElementById('order_money').value) <= parseInt(document.getElementById('reserve_money').value)){
			alert("订金金额大于等于订单总金额了");
			$('bank_name').value="";
			$('bank_code').value="";
			$('expect_pay_row').style.display="none";
			document.getElementById('reserve_money').value=0;
			document.getElementById('pay_money').value=document.getElementById('order_money').value;
			return false;

	}

	javascript:document.getElementById('pay_money').value=parseInt(document.getElementById('order_money').value)-parseInt(document.getElementById('reserve_money').value);

}
function change_o_pay_money(){
	if(document.getElementById('reserve_money').value != 0){
		document.getElementById('pay_money').value=parseInt(document.getElementById('order_money').value)-parseInt(document.getElementById('reserve_money').value);
	}else{
		document.getElementById('reserve_money').value=0;
		document.getElementById('pay_money').value=document.getElementById('order_money').value;
	}
	if(document.getElementById('order_money').value == ''){
		document.getElementById('pay_money').value='';
	}

}
window.onload=function(){

	if(<?php echo $order_result[10] ?> == 1){
		if(document.getElementById('is_super').value == 1 || document.getElementById('organ_info').value == '舒卫能'){
			var select_assign = document.getElementById("assign_express_id");

			select_assign.onfocus=function(){
				this.defaultIndex=this.selectedIndex;

			}

			select_assign.onchange=function(){
				this.selectedIndex=this.defaultIndex;

			}



		}

	}else{
		if(parseInt($('reserve_money').value)>0){
			$('expect_pay_row').style.display="";
		}

	}






}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">修改订单</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
<?php
//	if($is_amend){
?>
  <tr bgcolor="#ffffff">
    <td width="17%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单编号：</strong></td>
    <td width="83%" align="left"><input type="text" name="order_code" value="<?php echo $order_result[0]?>" readonly="true" style="border-width:0" /></td>
  </tr>
  <tr bgcolor="#ffffff" style="display:none">
    <td width="17%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单名称：</strong></td>
    <td width="83%" align="left"><input type="text" name="order_name" value="<?php echo $order_result[1]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单产品：</strong></td>
    <td width="84%" align="left" style="padding:10px" id="product_td">
		<div style="position:absolute;background:url(images/bg.gif);opacity:0.8;filter:alpha(opacity:80);margin-left:-10px;margin-top:-10px;display:none" id="black_div"></div>
		<input type="button" value="添加产品" onclick="createWindow()" style="height:35px;width:100px"/>　
		<div id="gift_list"></div>
		<div style="clear:both"></div>
		<div style="border:1px solid #ddd;background:#fcfcfc;padding:5px 10px;line-height:24px;margin-top:10px;color:#999">
			<strong>注意：</strong>添加产品时会有两种产品类型可供选择，主产品为实际销售的产品字体颜色标识为黑色，附属产品为不参与实际销售的产品字体颜色标识为灰色，当统计产品销售时系统会将订单的第一个主产品作为统计对象，其余的产品不做统计，请一定要按照正确的方式添加产品！
		</div>
	</td>
  </tr>
  <script type="text/javascript">
  <?php
  	$gift_result = $db -> query("select product_id,product_name,product_count,gift_money,gift_type from gift where order_id=".$order_id);
	foreach($gift_result as $item){
		echo "insertGift(".$item[4].",".$item[0].",'".$item[1]."',".$item[2].",'".$item[3]."');";
	}
  ?>
  var oldProduct = totalProduct();
  </script>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品疗程数量：</strong></td>
    <td width="83%" align="left"><input type="text" name="product_package_count" id="product_package_count" value="<?php echo $order_result[2]?>" onblur="if(this.value>50){alert('产品疗程数值过大，请检查是否输入正确！');this.select()}" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单总金额：</strong></td>
    <td width="83%" align="left"><input type="text" name="order_money" id="order_money" autoComplete="off" value="<?php echo round($order_result[3],1) ?>" onkeyup="change_o_pay_money()" onblur="javascript:if((parseInt(document.getElementById('pay_money').value)<0 && document.getElementById('pay_money').value != '')){alert('代收款金额不能为负或者不能为空');document.getElementById('order_money').value='';return false;}"/><span style="color:red">(*此处一定要手动填写 不能粘贴)</span></td>
  </tr>
  <?php if($order_result[10] == 0){ ?>
  <tr bgcolor="#ffffff" id="reserve_money_row" >
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订金金额：</strong></td>
    <td width="83%" align="left"><input type="text" name="reserve_money" id="reserve_money"  autoComplete="off" value="<?php echo round($order_result[27],1) ?>" onkeyup="change_pay_money()" onblur="javascript:if(parseInt(this.value)>0 && parseInt(document.getElementById('reserve_money').value) < parseInt(document.getElementById('order_money').value)){document.getElementById('expect_pay_row').style.display=''}else{document.getElementById('expect_pay_row').style.display='none';$('bank_name').value='';$('bank_code').value=''}"/><span style="color:red">(*此处一定要手动填写 不能粘贴)</span></td>
  </tr>
  <tr bgcolor="#ffffff" id="pay_money_row">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>代收款金额：</strong></td>
    <td width="83%" align="left"><input type="text" name="pay_money" id="pay_money" value="<?php echo round($order_result[28],1) ?>" readonly="readonly" /></td>
  </tr>
  <tr bgcolor="#ffffff" id="expect_pay_row" style="display:none">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收款账号：</strong></td>
    <td width="84%" align="left">
		收款帐号：<select onchange="var bank_array=this.value.split('|');$('bank_name').value=bank_array[0];$('bank_code').value=bank_array[1]" id="bank_reserve">
		<option value="|">请选择查询帐号</option>
		<?php
			//$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1".get_check_organ_sql(173));
			//暂时不判断机构了
			$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1");
			foreach($banks as $bank){
				echo "<option value=\"".$bank[1]."|".$bank[2]."\">".$bank[0]." [".$bank[1]."：".$bank[2]."]</option>";
			}
		?>
		<option value="其他银行|其他帐号">其他帐号</option>
		</select>
        <script type="text/javascript">chooseItem("bank_reserve","<?php echo $order_result[12]?>|<?php echo $order_result[13]?>")</script>
        <input name="bank_name" id="bank_name" type="hidden" value="<?php echo $order_result[12]?>" />
		<input name="bank_code" id="bank_code" type="hidden" value="<?php echo $order_result[13]?>" />
       </td>
  </tr>
  <?php } ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="83%" align="left"><input name="guest_name" type="text" value="<?php echo $order_result[5]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户年龄：</strong></td>
    <td width="83%" align="left"><input name="guest_age" type="text" value="<?php echo $order_result[31]?>" />(*必填项)</td>
  </tr>
  <tr bgcolor="#ffffff" id="guest_info_tr_0">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户资源添加时间：</strong></td>
    <td width="84%"  align="left">
    	<input name="resources_add_day" type="text" id="resources_add_day" onclick="showCalendar('resources_add_day','%Y-%m-%d',false,false,'resources_add_day')" value="<?php echo $order_result[29] ? date('Y-m-d',$order_result[29]) : $order_result[29] ?>" size="10" readonly="true"/>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户地区：</strong></td>
    <td width="83%" align="left">
		<script src="js/region.php"></script>
		<script type="text/javascript">chooseRegion("<?php echo $order_result[6]?>")</script>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货地址：</strong></td>
    <td width="83%" align="left"><input name="guest_address" id="guest_address" type="text" size="50" value="<?php echo $order_result[7]?>" />　<input type="button" value="插入地区" onclick="insertRegion('guest_address')" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货邮编：</strong></td>
    <td width="83%" align="left"><input name="guest_postcode" type="text" value="<?php echo $order_result[8]?>" maxlength="6" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>联系方式：</strong></td>
    <td width="83%" align="left" id="ContactBlock">
	<div>
		<span id="ItemTemplate">
		<select name="contact_type[]">
		<?php
			$item_result = $db -> query("select item_name from contact");
			foreach($item_result as $item){
				echo "<option value=\"".$item[0]."\">".$item[0]."</option>";
			}
		?>
    	</select>
		<input name="contact_value[]" type="text" maxlength="30" />
		</span>
		<input type="button" value="添加新项" onclick="insertItem()" />
	</div>
	<?php
		$contact_string = $order_result[9];
		if($contact_string!=""){
			$contact_item_array = explode("<br />",$contact_string);
			$contact_array = array();
			foreach($contact_item_array as $item){
				$contact_value_array = explode("：",$item);
				array_push($contact_array,$contact_value_array);
			}
		}
		echo "<script type=\"text/javascript\">";
		$contact_count = count($contact_array);
		if($contact_count>0){
			echo "var contact_type = $$$(\"select\",\"ItemTemplate\")[0];var contact_value = $$$(\"input\",\"ItemTemplate\")[0];for(var i=0;i<contact_type.length;i++){if(contact_type[i].value==\"".$contact_array[0][0]."\"){contact_type.selectedIndex=i;break}}contact_value.value=\"".$contact_array[0][1]."\";";
			for($i=1;$i<$contact_count;$i++){
			echo "insertItem();contact_type = $$$(\"select\",\"item\"+itemIndex)[0];contact_value = $$$(\"input\",\"item\"+itemIndex)[0];for(var i=0;i<contact_type.length;i++){if(contact_type[i].value==\"".$contact_array[$i][0]."\"){contact_type.selectedIndex=i;break}}contact_value.value=\"".$contact_array[$i][1]."\";";
			}
		}
		echo "</script>";
	?>	</td>
  </tr>
<?php
	if($order_result[14]==100){
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>支付方式：</strong></td>
    <td width="83%" align="left">
		<input type="radio" name="order_type_code" id="order_type_code0" value="0" onclick="chooseType(0)" />货到付款
        <input type="radio" name="order_type_code" id="order_type_code1" value="1" onclick="chooseType(1)" />款到发货
		<script type="text/javascript">$("order_type_code<?php echo $order_result[10]?>").checked="checked"</script>
	</td>
  </tr>
<?php
	}
	if($order_result[10]==1){
 ?>
  <tr bgcolor="#ffffff" id="expect_time_row">
    <td height="60" align="center" bgcolor="#f3f3f3"><strong>预计到款时间：</strong></td>
    <td width="83%" align="left">
		财务查询帐号：<select onchange="var bank_array=this.value.split('|');$('bank_name').value=bank_array[0];$('bank_code').value=bank_array[1]" id="bank">
		<option value="|">请选择查询帐号</option>
		<?php
			//$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1".get_check_organ_sql(173));
			//暂时不判断机构了
			$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1");
			foreach($banks as $bank){
				echo "<option value=\"".$bank[1]."|".$bank[2]."\">".$bank[0]." [".$bank[1]."：".$bank[2]."]</option>";
			}
		?>
		<option value="其他银行|其他帐号">其他帐号</option>
		</select>
		<script type="text/javascript">chooseItem("bank","<?php echo $order_result[12]?>|<?php echo $order_result[13]?>")</script>
		<div style="margin-top:5px">
		预计到款时间：<input name="expect_time" type="text" id="expect_time" value="<?php echo $order_result[11]?>" size="20" />
		</div>
		<input name="bank_name" id="bank_name" type="hidden" value="<?php echo $order_result[12]?>" />
		<input name="bank_code" id="bank_code" type="hidden" value="<?php echo $order_result[13]?>" />
	</td>
  </tr>
<?php
	}
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户资料：</strong></td>
    <td width="83%" align="left"><input type="checkbox" name="guest_update" value="true" />同时更新客户资料 (如果对客户资料做了修改，选中此项后，新的客户资料将被保存)	</td>
  </tr>

  <tr bgcolor="#ffffff" id="channel_tr">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="84%" align="left">
		<select name="order_channel" id="order_channel">
			<option value="">请选择订购渠道</option>
			<?php
			$order_channel_result = $db -> query("select id,name from order_channel where is_valid=1 order by order_index");
			if(!empty($order_channel_result)){
				foreach($order_channel_result as $order_channel_item){
					echo "<option value=\"".$order_channel_item[0]."|".$order_channel_item[1]."\">".$order_channel_item[1]."</option>";
				}
			}
			?>
		</select>
		<script type="text/javascript">
			chooseItem('order_channel','<?php echo $order_result[22]?>|<?php echo $order_result[23]?>');
		</script>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>指定快递公司：</strong></td>
    <td width="84%" align="left">
		<select name="assign_express_id" id="assign_express_id">
		<option value="0">选择要指定的快递公司</option>
		<?php
			$result = $db -> query('select id,express_name from express where is_valid=1'.get_check_organ_sql(172).' order by order_index');
			foreach($result as $key => $row){
				echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
			}
		?>
		</select>
		<script type="text/javascript">
			chooseItem('assign_express_id','<?php echo $order_result['assign_express_id']?>');
		</script>
	</td>
  </tr>
 <?php if($_SESSION['is_super'] || (get_organ_info('name')=='舒卫能')){ ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>活动标签：</strong></td>
    <td width="84%" align="left">
    	<select name="active_tag_id" id="active_tag_id">
        	<option value="0">请选择</option>
		<?php  $active_tag_data=$db->query('select * from active_tag where is_valid=1');
			foreach($active_tag_data as $a_data){
		?>
        	<option value="<?php echo $a_data['id'] ?>"><?php echo $a_data['active_name'] ?></option>
		<?php
			}
		 ?>

        </select>
        <script type="text/javascript">
			chooseItem('active_tag_id','<?php echo $order_result['active_tag_id']?>');
		</script>
	</td>
  </tr>
  <?php } ?>


  <tr bgcolor="#ffffff"<?php if($order['is_sent'])echo' style="display:none"'?> id="yunxufahuo">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>关联前是否允许发货：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<input name="is_allow_send" type="radio" value="1" id="is_allow_send_1" /><label for="is_allow_send_1">允许</label>
        <input type="radio" name="is_allow_send" value="0" id="is_allow_send_0" onclick="if(!confirm('不允许发货的订单发货部将看不到，如果没有关联需求请谨慎操作！\n\n确定不允许发货吗？'))$('is_allow_send_1').checked=true;" />暂不允许
		<div style="color:#ccc;margin-top:10px;line-height:20px">[在有关联订单需求时，为了防止已经添加的订单在未关联之前被发货，此时这个选项非常有用，在设置关联之后，系统将自动设置为允许发货，无关联需求请取默认值(允许)即可，不允许发货的订单发货部是看不到的，为了不影响发货，请慎重选择！！！！]</div>
	</td>
  </tr>
  <script type="text/javascript">
  	$('is_allow_send_<?php echo is_numeric($order_result['is_allow_send'])?$order_result['is_allow_send']:1?>').click();
  </script>

<?php
//	}
	if($order_result[14]==100){
?>
  <tr bgcolor="#ffffff" id="publish_tr">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发布类型：</strong></td>
    <td width="83%" align="left">
		<input name="publish_type" type="radio" value="0" id="publish_type_0" /><label for="publish_type_0">正式发布</label>
        <input type="radio" name="publish_type" value="1" checked="checked" id="publish_type_1" /><label for="publish_type_1">存草稿箱</label>
	</td>
  </tr>
<?php
	}

	if(check_function(177)){
?>
   <tr bgcolor="#ffffff">
       <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属微信：</strong></td>
       <td width="83%" align="left">
           <select name="wechat_id" id="wechat_id">
               <option value="">请选择所属微信</option>
               <?php
               $we_result = $db->query("select id,no from wechat");
               foreach($we_result as $value){?>
                   <option value="<?php echo $value['id'];?>" <?php if($order_result['wechat_id'] == $value['id']){echo"selected";}?> ><?php echo $value['no'];?></option>
               <?php } ?>
           </select>
       </td>

   </tr>
  <tr bgcolor="#ffffff" id="guest_tr">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服人员：</strong></td>
    <td width="83%" align="left">
	<select name="add_person" id="add_person">
	<option value="">请选择客服人员</option>
	<?php
		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

			$user_list=implode(',',array_strip($user_array));

		}

		if($user_list){
			$where_user=" and id in (".$user_list.")";
		}

        $result = $db -> query("select id,name,is_valid from user where group_id<3".$where_user);//已删除的也包括再内
        $z=array('a'=>1,'b'=>2,'c'=>3,'d'=>4,'e'=>5,'f'=>6,'g'=>7,'h'=>8,'i'=>9,'j'=>10,'k'=>11,'l'=>12,'m'=>13,'n'=>14,'o'=>15,'p'=>16,'q'=>17,'r'=>18,'s'=>19,'t'=>20,'u'=>21,'v'=>22,'w'=>23,'x'=>24,'y'=>25,'z'=>26);
        foreach($result as &$item){
            $item['num'] = $z[substr(strtolower(get_index_letter($item[1])),0,1)];
            $item['zimu'] = substr(get_index_letter($item[1]),0,1);
        }
        $result = sysSortArray($result,"num","SORT_ASC",'SORT_NUMERIC');
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row['zimu'].$row[1].($row[2]?"":"[已删除]")."</option>\n";
		}
	?>
	</select>
	<script type="text/javascript">chooseItem("add_person","<?php echo $order_result[18]?>")</script>
	</td>
  </tr>
<?php
	}
?>

  <tr bgcolor="#ffffff" id="organ_tr">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="84%" align="left">
		<?php
			organ_select(171,$order_result[19]);
		?>
	</td>
  </tr>
	<?php
		if($order_result[10]==0&&$order_result[14]>400){
			$state_name = "调整订单状态为";
			$state_name .= $order_result[14]==700?"需要退货":"确认到款";
	?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>回滚订单流程状态：</strong></td>
    <td width="83%" align="left">
		<input type="checkbox" name="is_back_state" value="true" id="is_back_state" /><label for="is_back_state"><?php echo $state_name?></label> (此功能只在财务批量签收订单失误时使用)
	</td>
  </tr>
  <?php
  		}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单备注：</strong></td>
    <td width="83%" align="left"><textarea name="order_intro" cols="50" style="height:80px;margin:5px 0;font-size:13px;overflow:auto"></textarea></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="hidden" id="is_super" value="<?php echo $_SESSION['is_super']; ?>">
    	<input type="hidden" name="organ_info" value="<?php echo get_organ_info('name'); ?>">
		<input type="button" value=" 保 存 " onclick="checkForm()" id="amend_button" style="width:90px;height:35px;margin-right:40px" />
		<input type="reset" value=" 清 除 " style="width:90px;height:35px" />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>

  <?php
  	if(!$is_amend_sended){
  ?>
  <script type="text/javascript">
  function setSize(){
	$('black_div').style.width = $('black_div').parentNode.clientWidth + 'px';
	var tr = $('black_div').parentNode.parentNode.nextSibling;
	var height = $('black_div').parentNode.clientHeight;
	while(true){
		//if(!tr || tr.id=='publish_tr' || tr.id=='guest_tr' || tr.id=='organ_tr')break;
		if(!tr || tr.id=='channel_tr')break;
		if(tr.nodeType==1 && tr.tagName.toLowerCase()=='tr'){
			height += tr.getElementsByTagName('td')[1].clientHeight+1;
		}
		tr = tr.nextSibling;
	}
	height--;
  	$('black_div').style.height = height + 'px';
  };
  $('black_div').style.display = 'block';
  setSize();
  $('product_td').getElementsByTagName('input')[0].onclick = null;
  var deleteButtonList = $('product_td').getElementsByTagName('a')
  for(var i=0;i<deleteButtonList.length;i++){
  	deleteButtonList[i].onclick = null;
  }
  window.onresize=setSize;
  $('product_package_count').onfocus = function(){this.blur()};
  $('order_money').onfocus = function(){this.blur()};
  </script>
  <?php
  	}
  ?>


<?php
}

//关联附属订单
function relate(){
	include 'include/guide.php';
	$guide = new guide();
	$db = new db(true);

	$order_id = $_GET['order_id'];
	if(empty($order_id))$order_id=get_selected(false,1);

	$src_list = $_GET['src_list'];
    if(empty($src_list))$src_list=encode($_SERVER['HTTP_REFERER']);
	$src_list_param = '&src_list='.$src_list;
	$src_list = encode($src_list,FALSE);
	$order = $db->query('select guest_id,parent,addition_id,order_type_code,is_sent from orderform where id='.$order_id,true,'assoc');

	//不是自己的订单
	/*
	if(!check_self($order['addition_id'])){
		$guide -> set_message('对不起，该订单不是你的，你没有权限操作！',true);
		$guide -> append("订单列表",$src_list);
        $guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id.$src_list_param);
		$guide -> out();
	}
	*/

	//是附属订单
	if($order['parent']){
		$guide -> set_message('该订单是附属订单，不能再为它添加附属订单！',true);
		$guide -> append("订单列表",$src_list);
        $guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id.$src_list_param);
		$guide -> out();
	}



	//已发货
	if($order['is_sent']){
		$guide -> set_message('对不起，该订单已经发货，不能再进行关联操作！',true);
		$guide -> append("订单列表",$src_list);
        $guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id.$src_list_param);
		$guide -> out();
	}



	if($_GET['method']=='post'){

		$select_order_id_array = (array)get_selected(true);
		$select_order_id_count = count($select_order_id_array);

		//先取消该订单下的附属订单
		$db->execute('update orderform set parent=0 where is_valid=1 and parent='.$order_id);

		$sent_order_array = array();
		if($select_order_id_count){
			$select_order_id_string = implode(',',$select_order_id_array);

			//然后查询选中的订单，是否有已发货的
			$sent_order_result = $db->query('select order_code from orderform where id in ('.$select_order_id_string.') and is_sent=1','row');
			if(count($sent_order_result))$sent_order_array = array_strip($sent_order_result);

			//设置选中的订单
			$db->execute('update orderform set parent='.$order_id.',is_allow_send=1 where id in('.$select_order_id_string.') and is_sent=0');

		}

		$sent_order_count = count($sent_order_array);

		$relate_order_count = $select_order_id_count-$sent_order_count;

		//更新本订单的附属总数,允许发货
		$db->execute('update orderform set child_count='.$relate_order_count.',is_allow_send=1 where id='.$order_id);

		$guide -> set_message('已成功关联'.$relate_order_count.'个附属订单！');
		if($sent_order_count){
			$guide -> set_intro('<p style="color:#f00">有'.$sent_order_count.'个订单因为已经发货而未关联成功，具体订单编号如下：</p>'.implode(',',$sent_order_array));
			$guide -> set_auto(FALSE);
		}

		$guide -> append("订单列表",$src_list);
        $guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id.$src_list_param);
		$guide -> out();


	}

	$order_result = $db->query('select id,order_code,order_money,product_package_count,guest_id,guest_name,order_type_code,order_type_name,add_time,parent,child_count,is_sent from orderform where is_valid=1 and guest_id='.$order['guest_id'].' and id!='.$order_id.' order by id desc','assoc');
?>
<script type="text/javascript">
function submitSave(url){
	with(document.forms[0]){
		action = url;
		method = 'post';
		submit();
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">关联发货的附属订单（主订单所属客户的所有订单）</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">
  <tr bgcolor="#f3f3f3">
    <td width="5%" height="30" align="center"><strong>序列</strong></td>
    <td width="10%" align="center"><strong>订单编号</strong></td>
    <td width="13%" align="center"><strong>产品列表</strong></td>
    <td width="11%" align="center"><strong>金额疗程</strong></td>
    <td width="11%" align="center"><strong>客户姓名</strong></td>
    <td width="11%" align="center"><strong>订单类型</strong></td>
    <td width="12%" align="center"><strong>创建时间</strong></td>
    <td width="19%" align="center"><strong>订单状态</strong></td>
    <td width="8%" align="center"><strong>选择</strong></td>
  </tr>
  <?php
  	foreach($order_result as $key => $row){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center"><?php echo $key+1?></td>
    <td align="center"><a href="?c=ample&order_id=<?php echo $row['id']?>"><?php echo $row['order_code']?></a></td>
    <td align="center">
	<?php
		$gift_list = $db->query("select product_id,product_name from gift where gift_type=1 and order_id=".$row['id']);
		foreach($gift_list as $gift){
	?>
	<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift[0]?>"><?php echo $gift[1]?></a></div>
	<?php
		}
	?>
	</td>
    <td align="center"><?php echo round($row['order_money'],1).'丨'.$row['product_package_count']?></td>
    <td align="center"><a href="guest.php?c=ample&guest_id=<?php echo $row['guest_id']?>"><?php echo $row['guest_name']?></a></td>
    <td align="center"><span<?php echo ($row['order_type_code']?' style="color:#999"':'')?>><?php echo $row['order_type_name']?></span></td>
    <td align="center"><?php echo date_diff($row['add_time'])?></td>
    <td align="center">
	<?php

		$is_edit = false;
		if( $row['child_count'] ){
			echo '<span style="color:#f00">有'.$row['child_count'].'个附属订单的主订单</span>';
		}elseif( $row['parent'] && $row['parent']!=$order_id ){
			echo '<span style="color:#f00">其他订单的附属订单</span>';
		//}elseif($row['order_type_code']!=$order['order_type_code']){
		//	echo '<span style="color:#f00">与主订单付款类型不一致</span>';
		}elseif($row['is_sent']){
			echo '<span style="color:#f00">已经发货</span>';
		}elseif($row['parent']==$order_id){
			$is_edit = true;
			echo '<span style="color:#0b3">本主订单的附属订单</span>';
		}else{
			$is_edit = true;
			echo '<span style="color:#0b3">无关联</span>';
		}
	?>
	</td>
    <td align="center"><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row['id']?>" <?php
	if($row['parent']==$order_id){
		echo 'checked="checked"';
	}elseif(!$is_edit){
		echo 'disabled="disabled"';
	}?> /></td>
  </tr>
  <?php
  	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="9" align="center">
		<input type="button" value=" 保存关联设置 " onclick="submitSave('?c=relate&method=post&order_id=<?php echo $order_id.$src_list_param?>')" style="height:40px" />
	</td>
  </tr>
</table>
</form>
<div style="margin-top:20px">
	<p style="text-align:left;color:#f00;font-weight:bold">请认真阅读并注意以下事项：</p>
	<p style="text-align:left;color:#888;line-height:20px">
		1）该订单列表显示的是，所勾选的订单的客户的所有的订单（勾选的主订单除外），订单状态为红色的是不符合关联要求的，只有绿色的可以选择作为附属订单。<br />
		2）关联订单的作用是为了多个订单的货物可以打包在一起发货，因此只有主订单是可以处理发货的，附属订单不允许单独处理发货，如果已设置好关联，发货部在处理主订单的发货时，所有订单的销售产品和金额都是合并之后的。
		3）只有与勾选的主订单属于同一个客户（不等于同名）才可以关联，否则这个列表内是不显示的。
	</p>
</div>
	</td>
  </tr>
</table>
<?php
}

function remove(){
	check_user(47);
	$db = new db(true);
	$time = get_time();
	$order_id_array = get_selected(true);
	if(!count($order_id_array)){
        $order_id_array[] = $_GET["order_id"];
	}

	$order_id_string = implode(',',$order_id_array);

	$deleted_order_id_array = array();
	//如果已发货，判断修改权限
	$order_result = $db->query('select id,order_state_code,is_sent,is_valid,product_id,product_name,send_time,order_money from orderform where id in('.$order_id_string.') and is_valid=1');
	foreach($order_result as $order){
		//如果未删除
        if($order[3]){
            if($order[1]==400||$order[2]==1){
                if(!check_function(182))alert_message(182);
            }
		//如果已删除，则过滤掉
        }else{
            $index = array_search($order[0],$order_id_array);
            $deleted_order_id_array[] = $order_id_array[$index];
            unset($order_id_array[$index]);
        }
	}

	$order_id_string = implode(',',$order_id_array);

	$incomplete_count = count($deleted_order_id_array);
	$complete_count = count($order_id_array);

	if($complete_count){

        $db->execute("update orderform set is_valid=0,delete_person_id=".$_SESSION["user_id"].",delete_person_name='".$_SESSION["user_name"]."',delete_time='".$time."' where id in(".$order_id_string.")");

		//记录更新数据的日志数组
		$data_update_logs_array = array();

		//将修改客户的数据加入到更新日志
		$data_update_logs_array['update_orderform'] = array(
			'data'	=>	array(
				'is_valid'				=>		0,
				'delete_user_id'		=>		$_SESSION["user_id"],
				'delete_person_name'	=>		$_SESSION["user_name"],
				'delete_time'			=>		$time,
			),
			'where'	=>	array(
				'order_id'	=>	$order_id_string,
			),
		);

		//将更新数据写入到日志文件中
		append_update_logs('remove_order',$data_update_logs_array);


        //返库存
        $gift_result = $db->query('select product_id,product_count,order_id,product_name from gift where order_id in('.$order_id_string.')');

        //整理合并一下
        $gift_array = array();
        foreach($gift_result as $gift){
            if($gift_array[$gift[0]]){
                $gift_array[$gift[0]] += $gift[1];
            }else{
                $gift_array[$gift[0]] = $gift[1];
            }
        }
        unset($gift);

        //返还库存
        foreach($gift_array as $id => $count){
            $db->execute('update product set stock_count=stock_count+'.$count.' where id='.$id);
        }

		//写入库单2015.7.22
		$order_gift_array = array();
		foreach($gift_result as $gift){
			if(!$order_gift_array[$gift['order_id']])$order_gift_array[$gift['order_id']]=array();
			if(!$order_gift_array[$gift['order_id']][$gift['product_id']]){
				$order_gift_array[$gift['order_id']][$gift['product_id']]=array(
					'id'	=>	$gift['product_id'],
					'name'	=>	$gift['product_name'],
					'count'	=>	$gift['product_count'],
				);
			}else{
				$order_gift_array[$gift['order_id']][$gift['product_id']]['count']+=$gift['product_count'];
			}
		}
		$insert_values = array();
		foreach($order_gift_array as $order_id => $product_array){
			foreach($product_array as $product_id => $product){
				$organ_id = $db->query("select c.organ_id from product as p,product_class as c where p.id=".$id." and p.class_id=c.id",true,true);
				$insert_values[] = array(
					'type'			=>	2,
					'product_id'	=>	$product['id'],
					'product_name'	=>	$product['name'],
					'unit_count'	=>	$product['count'],
					'input_time'	=>	get_time(),
					'person_id'		=>	$_SESSION['user_id'],
					'person_name'	=>	$_SESSION['user_name'],
					'state'			=>	1,
					'order_id'		=>	$order_id,
					'organ_id'		=>	$organ_id,
				);
			}
		}

		$db->batch_insert('inputrecord',$insert_values);




		//清除产品销售数据缓存
		clear_cache('product_sell_data',true);

		//如果删除以前的订单，那么减去推广数据中的点击消费数据
		foreach($order_result as $order){
			if($order['send_time']){
				$order_date = date('Y-m-d',strtotime($order['send_time']));

				if(strtotime($order_date)<strtotime(date('Y-m-d'))){
					$extend_product_id = $db->query('select id from extend_product where relevance_type=1 and relevance_id='.$order['product_id'],true,true);
					if(!$extend_product_id)$extend_product_id = $db->query('select id from extend_product where relevance_type=0 and relevance_id='.$order['product_id'],true,true);
					if(!$extend_product_id)continue;

					/*
					$db->update('extend_sell_data',array(
						'sell_money'	=>	array(-$order['order_money']),
					),'extend_date=\''.$order_date.'\' and product_id='.$extend_product_id);
					*/

					//重新加载销量
					$result = curl(array(
						'url'	=>	'http://localhost:'.$_SERVER['SERVER_PORT'].'/get.php?c=get_sell_data',
						'post'	=>	1,
						'fields' => 'date='.$order_date.'&product_id[]='.$extend_product_id,
					));
					$result = json_decode($result,TRUE);
					$data = $result[$extend_product_id];
					if(!$data)$data = array(0,0);

					$db->update('extend_sell_data',array(
						'sell_count'	=>	$data[0],
						'sell_money'	=>	$data[1],
					),'extend_date=\''.$order_date.'\' and product_id='.$extend_product_id);

				}
			}
		}




	}
	include("include/guide.php");
	$guide = new guide();

	$guide -> set_message("订单删除完成！");


	//来源列表地址
	$src_list = $_GET['src_list'];
    if(empty($src_list))$src_list=encode($_SERVER['HTTP_REFERER']);
	$src_list_param = '&src_list='.$src_list;
    $src_list=encode($src_list,FALSE);
    $guide -> append("订单列表",$src_list);

	if(strpos($order_id_string,',')===FALSE){
        $guide -> append("订单详细页","order.php?c=amply&order_id=".$order_id_string.$src_list_param);
    }

	$guide -> out();
}

function browse_order_channel(){
	check_user(186);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">订购渠道列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">
  <tr bgcolor="#f3f3f3">
    <td height="30" align="center"><strong>序列</strong></td>
    <td align="center"><strong>订购渠道名称</strong></td>
    <td align="center"><strong>选择</strong></td>
  </tr>
<?php
	include_once("include/page.php");
	$organ_id = $_GET['organ_id'];
	$sql = "select id,name from order_channel where is_valid=1";
	$page = new page($sql,'c=browse_order_channel');
	$page_result = $page->get_result();
	foreach($page_result as $key => $row){
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center"><?php echo $row[1]?></td>
    <td align="center"><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row[0]?>" /></td>
  </tr>
<?php
	}
?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="4" align="center"><?php $page->show_guide()?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="4" align="center">
		<input type="button" value=" 添 加 " onclick="location.href='?c=append_order_channel'" />　
		<input type="button" value=" 修 改 " onclick="command('?c=amend_order_channel&offset=<?php echo $page->get_offset()?>')" />　
		<input type="button" value=" 删 除 " onclick="command('?c=remove_order_channel&offset=<?php echo $page->get_offset()?>','真的要删除这些用户组吗？')" />
		<input type="button" value=" 反 选 " onclick="selectCheck('reverse')" />　
		<input type="button" value=" 全 选 " onclick="selectCheck('all')" />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}


//添加订购渠道
function append_order_channel(){
	check_user(186);
	if($_GET["method"]=="post"){
		$db = new db(true);
		include_once("include/guide.php");
		$guide = new guide();
		$order_channel_name = $_POST["order_channel_name"];
		$order_channel_descriptions = $_POST["order_channel_descriptions"];
		$search_count = $db -> query("select count(*) from order_channel where is_valid=1 and name='$order_channel_name'",true,true);
		if($search_count>0){
			$guide -> set_message("对不起，订购渠道名称[$order_channel_name]已经存在！",true);
		}else{
			$db->execute("insert into order_channel(name,descriptions) values('$order_channel_name','$order_channel_descriptions')");
			$guide -> set_message("订购渠道名称添加成功！");
		}
		$guide -> append("订购渠道列表","?c=browse_order_channel");
		$guide -> append("继续添加订购渠道","?c=append_order_channel");
		$guide -> out();
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
		if(order_channel_name.value==""){
			alert("请输入订购渠道名称！");
			return;
		}
		$('submit_btn').disabled=true;
		action = "?c=append_order_channel&method=post";
		method = "post";
		submit();
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">添加订购渠道</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道名称：</strong></td>
    <td width="84%" align="left"><input name="order_channel_name" type="text" size="30" maxlength="20" /></td>
    </tr>
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道描述：</strong></td>
    <td width="84%" align="left">
		<textarea name="order_channel_descriptions" cols="30" rows="3"></textarea>
	</td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value=" 添 加 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function amend_order_channel(){
	check_user(186);
	$db = new db(true);
	$order_channel_id = $_GET["order_channel_id"];
	if(empty($order_channel_id))$order_channel_id=get_selected(false,1);
	if($_GET["method"]=="post"){
		include_once("include/guide.php");
		$guide = new guide();
		$order_channel_name = $_POST["order_channel_name"];
		$order_channel_descriptions = $_POST["order_channel_descriptions"];
		$search_count = $db -> query("select count(*) from order_channel where is_valid=1 and name='$order_channel_name' and id<>$order_channel_id",true,true);
		if($search_count>0){
			$guide -> set_message("对不起，订购渠道名称[$order_channel_name]已经存在！",true);
		}else{
			$db->execute("update order_channel set name='$order_channel_name',descriptions = '$order_channel_descriptions' where id=".$order_channel_id);
			$guide -> set_message("订购渠道修改成功！");
		}
		$guide -> append("订购渠道列表","?c=browse_order_channel");
		$guide -> append("修改订购渠道","?c=amend_order_channel&order_channel_id=".$order_channel_id);
		$guide -> append("添加订购渠道","?c=append_order_channel");
		$guide -> out();
	}
	$order_channel_result = $db -> query("select name,descriptions from order_channel where id=".$order_channel_id,true);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
		if(order_channel_name.value==""){
			alert("请输入订购渠道类型名称！");
			return;
		}
		$('submit_btn').disabled=true;
		action = "?c=amend_order_channel&order_channel_id=<?php echo $order_channel_id?>&method=post";
		method = "post";
		submit();
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">修改订购渠道</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道名称：</strong></td>
    <td width="84%" align="left"><input name="order_channel_name" type="text" size="30" maxlength="20" value="<?php echo $order_channel_result[0]?>" /></td>
    </tr>
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道描述：</strong></td>
    <td width="84%" align="left">
		<textarea name="order_channel_descriptions" cols="30" rows="3"><?php echo $order_channel_result[1]?></textarea>
	</td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value=" 修 改 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function remove_order_channel(){
	check_user(186);
	$selected_list = get_selected();
	$db = new db(true,true);
	$db -> execute("update order_channel set is_valid=0 where id in(".$selected_list.")");
	include_once("include/guide.php");
	$guide = new guide();
	$guide -> set_message("订购渠道删除成功！");
	$offset = $_GET["offset"];
	if(!isset($offset))$offset = 0;
	$guide -> append("订购渠道列表","?c=browse_order_channel&offset=".$offset);
	$guide -> append("添加订购渠道","?c=append_order_channel");
	$guide -> out();
}


function send_list($t="w",$w="",$order_type=0){

	$db = new db(true);

?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">

function remove(url,index){

    <?php
    //如果有删除权限
    if(check_function(47)){
    ?>
	if(index=='') var index=0;
    var inputList = document.forms[0].getElementsByTagName('input');
	if(inputList[0].type=='button'){
		var inputList = document.forms[1].getElementsByTagName('input');
	}else{
		var inputList = document.forms[0].getElementsByTagName('input');
	}
    var sentCount = 0;
    for(var i=0;i<inputList.length;i++){
        if(inputList[i].type=='checkbox'){
            if(inputList[i].checked){
                if(inputList[i].parentNode.getElementsByTagName('span')[0].innerHTML=='1'){
                    <?php if(check_function(182)){?>inputList[i].parentNode.parentNode.style.background='#fcc';<?php }?>
                    sentCount++;
                }
            }
        }
    }
    if(sentCount){
    <?php
        //如果有删除已发货订单的权限
        if(check_function(182)){
    ?>
		var message = '严重 警告！！！！！请认真阅读下面的说明并按提示谨慎操作！\n\n\n删除订单将自动返还系统内的库存，您所选择的所有待操作的订单中至少包含一个【发货中】或【已发货】的订单，并已用红色标注，这需要您核实一下该订单的货物是不是可追回的！\n\n1.如果是可追回的(快递还没取走)，那么如果您确定要删除这些的话，您可以点确定按钮删除这些订单，然后把退回的货物放回仓库！\n2.如果是不可追回的(快递已经取走)，由于没有办法将货物立即退回仓库，所以请不要点击确定按钮，请不要删除订单，以免造成库存混乱，这种情况的订单，请走退货流程，等待收到退货！';
        if(window.confirm(message)){
            command(url);
        }
    <?php
        //否则没有删除已发货的权限
        }else{
    ?>
        alert('<?php echo get_alert_message(182)?>');
    <?php
        }
    ?>
    }else{
        if(window.confirm('确定要删除这些订单吗？')){
            command(url,'',index);
        }
    }
    <?php
    }else{
    ?>
    alert('<?php echo get_alert_message(47)?>');
    <?php
    }
    ?>
}


<?php
	if($t=='w'){

?>

function get_choosed_order_id(){
	var order_id_array = [];
	var inputList = document.forms[0].getElementsByTagName('input');
	if(inputList[0].type=='button'){
		var inputList = document.forms[1].getElementsByTagName('input');
	}else{
		var inputList = document.forms[0].getElementsByTagName('input');
	}
	for(var i=0;i<inputList.length;i++){
		if(inputList[i].type=='checkbox'){
			if(inputList[i].checked){
				order_id_array.push(inputList[i].value);
			}
		}
	}
	return order_id_array;
}


window.onload=function(){
	var bg = document.createElement('div');
	var win = document.createElement('div');
	bg.id = 'bg';
	win.id = 'win';
	bg.style.cssText = 'position:absolute;left:0;top:0;background:url(../images/bg.gif);display:none';
	win.style.cssText = 'position:absolute;left:0;top:0;z-index:1;border:5px solid #ddd;padding:20px;background:#fff;display:none';
	win.innerHTML = '\
		<div style="margin-top:10px">\
			选择快递公司：\
			<select id="batch_express">\
			<?php
				$express_array = $db->query('select id,express_name as name from express where is_valid=1 and is_allow_batch=1');
				foreach($express_array as &$express)$express['name'] = current(explode('-',$express['name']));
				unset($express);
				foreach($express_array as $express){
					echo '<option value="'.$express['id'].'">'.$express['name'].'</option>';
				}
			?>
			</select>\
		</div>\
		<div style="color:#f60;margin-top:10px">小提示：<br />1.加入批量发货时只勾选主订单就可以了哦<br />2.系统会自动忽略掉不符合要求的订单</div>\
		<div style="margin-top:15px" id="btn_list"><input type="button" value="确 定" style="height:30px;width:80px" /> <input type="button" value="取 消" style="height:30px;width:80px;margin-left:20px" /></div>\
	';
	document.body.appendChild(bg);
	document.body.appendChild(win);

	var btnList = $$$('input','btn_list');
	btnList[0].onclick = function(){
		var order_id_array = get_choosed_order_id();
		if(!order_id_array.length){
			alert('请至少要选择一个要加入批量发货列表的订单！');
			return;
		}

		if($('batch_express').value==''){
			alert('请选择快递公司！');
			return;
		}

		var param_array = [];
		param_array.push('express_id='+$('batch_express').value);
		for(var i=0;i<order_id_array.length;i++){
			param_array.push('order_id[]='+order_id_array[i]);
		}

		this.disabled=true;
		execute('post','get.php?c=join_batch_send_list',function(string){
			if(string!='ok'){
				alert(string);
				this.disabled=false;
				return;
			}

			location.reload();

		},param_array.join('&'));

	};
	btnList[1].onclick=hideExpressWindow;
	$('show_join_batch_express_btn').onclick=showExpressWindow;
};

function showExpressWindow(){
	var order_id_array = get_choosed_order_id();
	if(!order_id_array.length){
		alert('请至少要选择一个要加入批量发货列表的订单！');
		return;
	}
	var width = document.documentElement.scrollWidth<document.documentElement.clientWidth?document.documentElement.clientWidth:document.documentElement.scrollWidth;
	var height = document.documentElement.scrollHeight<document.documentElement.clientHeight?document.documentElement.clientHeight:document.documentElement.scrollHeight;
	var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	$('bg').style.display = '';
	$('bg').style.width = width+'px';
	$('bg').style.height = height+'px';
	$('win').style.display = '';
	$('win').style.left = scrollLeft + ((document.documentElement.clientWidth-$('win').clientWidth-100)>>1) + 'px';
	$('win').style.top = scrollTop + ( ((document.documentElement.clientHeight-$('win').clientHeight-100)>>1)+50 ) + 'px';
}

function hideExpressWindow(){
	$('bg').style.display = 'none';
	$('win').style.display = 'none';
}

<?php
	}
?>

</script>
<form>

<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">
  <tr bgcolor="#f3f3f3">
    <td width="3%" height="30" align="center"><strong>序列</strong></td>
    <td width="7%" align="center"><strong>订单编号</strong></td>
	<?php
		if($t!=="w"){
			include 'include/express.config.php';
			$express_title = '快递信息';
		}else{
			$express_title = '指定快递';
		}
	?>
    <td width="11%" align="center"><strong><?php echo $express_title?></strong></td>
    <td width="5%" align="center"><strong>客服姓名</strong></td>
    <td width="5%" align="center"><strong>产品名称</strong></td>
    <td width="8%" align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
    <td width="5%" align="center"><strong>客户姓名</strong></td>
    <td width="7%" align="center"><strong>客户地区</strong></td>
    <td width="14%" align="center"><strong>收货地址</strong></td>
    <td width="9%" align="center"><strong>联系方式</strong></td>
    <td width="10%" align="center"><strong>订单状态</strong></td>

	<?php
		if($t==="w"){
	?>
    <td width="10%" align="center"><strong>订单备注</strong></td>
	<?php
		}
	?>
	<td width="6%" align="center"><strong>关联关系</strong></td>
    <td width="3%" align="center"><strong>选择</strong></td>
  </tr>
<?php
	include_once("include/page.php");
	$sql = "select id,order_code,order_name,addition_id,addition_name,addition_phone,product_id,product_name,order_money,product_package_price,guest_id,guest_name,guest_region_name,guest_address,guest_postcode,guest_contact,order_type_code,order_state_name,express_name,express_order_code,order_state_code,is_valid,is_sent,order_intro,parent,express_status,assign_express_name,reserve_money,pay_money,is_allow_send from orderform where  ";
	switch($t){
		case "w":
			if(!empty($w)){
				$wh=$w;
			}else{
				$wh='';
			}
			$sql .= "is_valid=1 and (order_state_code=300 or order_state_code=400) and is_batch=0".$wh.get_check_organ_sql(171);
			$common_param = get_common_param();
			$button = "<input type=\"button\" value=\"处理发货\" onclick=\"command('?c=send&".$common_param."','警告：\\n\\n待发货订单列表内没有显示出赠品以及具体产品数量，为避免发货的产品出现遗漏，请尽量在订单详细页内处理发货！\\n\\n亲，你要不顾风险依然坚持处理发货吗？\\n\\n',1)\" />　";

			$button .= '<input type="button" value="加入批量发货列表" id="show_join_batch_express_btn" />　';

			if(!empty($w)){
				$w = "&w=".$w;
				$common_param .= $w;
			}

			$param = "wait";
			break;
		case "b":
			$sql .= "is_valid=1 and order_state_code=500".encode($w,false).get_check_organ_sql(171);
			$offset = $_GET["offset"];
			if(empty($offset))$offset = 0;
			$offset = "offset=".$offset;
			$common_param = $offset;
			if(!empty($w)){
				$w = "&w=".$w;
				$common_param .= $w;
			}
			$button = '<input type="button" value="收到退货" onclick="command(\'?c=set_return_stock&type=1&'.$common_param.'\',\'警告！！！！！请认真阅读下面的说明并按提示谨慎操作！\n\n确认退货后会自动返还该订单产品的库存，请确认货品是否真的已收到！\n\n1.如果已收到，请点击确定按钮确认退货然后请将货品放回仓库！\n2.如果未收到，请点击取消按钮，不要确认退货，以免造成库存混乱！\')" />　';
			$param = "back";
			break;
		case "c":
			$param = "complete";
			$get_order_type = $_GET["order_type"];
			if(isset($get_order_type))$order_type = $get_order_type;
			switch($order_type){
				case 0:
					//$order_type_sql = "(((order_state_code=200 or order_state_code=500 or order_state_code=600) and order_type_code=0) or order_state_code=700)";
					$order_type_sql = 'is_sent=1';
					break;
				case 1:
					$order_type_sql = "((order_state_code=200 and order_type_code=0) or order_state_code=700)";
					$param .= "&order_type=1";
					break;
				case 2:
					$order_type_sql = "order_state_code=600";
					$param .= "&order_type=2";
					break;
			}

			$sql .= $order_type_sql.encode($w,false).get_check_organ_sql(171);
			$offset = $_GET["offset"];
			if(empty($offset))$offset = 0;
			$offset = "offset=".$offset;
			$common_param = $offset;
			if(!empty($w)){
				$w = encode(encode($w,false).get_check_organ_sql(171));
				$w = "&w=".$w;
				$common_param .= $w;
			}
			$button = '<input type="button" '.check_button(56,NULL,true).' value=" 修改发货信息 " onclick="command(\'?c=express&src='.$param.'&'.$common_param.'\')" />　';
			$button .= '<input type="button" '.check_button(54,NULL,true).' value=" 直接退货 " onclick="command(\'?c=set_return_stock&type=0&src='.$param.'&'.$common_param.'\',\'处理退货之前请确认已经收到该订单的退货！\n\n你确定要处理退货吗？\')" />　';
			break;
	}

	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

		$user_team_id_array=array_strip($_SESSION['user_team']);
		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

	}


	if($product_list){
		$sql .= " and product_id in (".$product_list.")";
	}


	$organ_id = $_GET['organ_id'];
	if(!empty($organ_id)){
		$sql .= 'and organ_id='.$organ_id;
		$w .= '&organ_id='.$organ_id;
	}

	$sql .= " order by is_allow_send desc,id desc";

	$page = new page($sql,"c=".$param.$w);
	$page_result = $page -> get_result(false);
	foreach($page_result as $key => $row){
?>
  <tr bgcolor="#ffffff"<?php
  	if($t=="c"&&$row[21]==0)echo " class=\"deleted\"";
  ?>>
    <td height="30" align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center"><a href="?c=amply&order_id=<?php echo $row[0]?>"><?php echo $row[1]?></a></td>
    <td align="center"><?php
		if($row['express_name']){
			if(strpos($row['express_name'],'-')!==FALSE)$row['express_name']=current(explode('-',$row['express_name']));
			echo $row['express_name'].'：'.$row['express_order_code'];
			$express_status = $row['express_status'];
			if(is_numeric($express_status)){
				echo '<span style="color:#'.$express_status_pointer[$express_status]['color'].';margin-left:5px">['.$express_status_pointer[$express_status]['name'].']</span>';
			}
		}else{
			if($row['assign_express_name'])echo '<span style="color:#ccc">'.$row['assign_express_name'].'</span>';
		}
	?></td>
    <td align="center"><a href="user.php?c=amply&user_id=<?php echo $row[3]?>"><?php echo $row[4]?></a></td>
    <td align="center">
	<?php
		$gift_sql = 'select product_id,product_name,gift_type from gift where order_id='.$row[0].' and gift_type=1';
		$gift_list = $page -> db -> query($gift_sql);
		foreach($gift_list as $gift){
	?>
	<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift[0]?>"><?php echo $gift[1]?></a></div>
	<?php
		}
	?>
	</td>
	<?php   if($_SESSION['organ_name']!='极米' ||  check_function(225) || $row['addition_id']==$_SESSION['user_id']){ ?>
    <td align="center"><?php if($row[16] == 0){echo  (round($row[8],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($row[27],1).'</span>+<span style="color:red">'.(round($row[28],1) ? round($row[28],1) : round($row[8],1))).'</span>)</span>');}else{echo round($row[8],1);}?></td>
    <?php }else{ ?>
             <td align="center">
                <?php if($row[16] == 0){
                    echo  '***<br/><span style="color:#ccc">(<span style="color:#0099FF">***</span>+<span style="color:red">'.(round($row[28],1) ? round($row[28],1) : round($row[8],1)).'</span>)</span>';
                    }else{
                    echo '***';
                    }
                ?>
            </td>
    <?php } ?>
    <td align="center"><a href="guest.php?c=amply&guest_id=<?php echo $row[10]?>"><?php echo $row[11]?></a></td>
    <td align="center"><?php echo round_region($row[12])?></td>
    <td align="center"><?php echo $row[13]?></td>
    <td align="center"><?php echo $row[15]?></td>
    <td align="center">
	<?php
	if($row[16]&&$t=="w"&&$row[20]!=400)echo "<span style=\"color:#f00\">已付款</span>,";
	echo $row[17];
	if($row['is_allow_send']==0){
		echo '(<span style="color:red;font-weight:bold">暂不发货</span>)';
	}

	?>
	</td>
	<?php
		if($t==="w"){
	?>
    <td align="center"><?php echo $row['order_intro']?></td>
	<?php
		}
	?>
    <td align="center"><?php echo $row['parent']?'<span style="color:#ccc">附属订单</span>':'主订单'?></td>
    <td align="center">
    <span style="display:none"><?php echo ($row[22]||$row[20]==400)?'1':'0'?></span>
    <input type="checkbox" name="ChooseCheck[]" value="<?php echo $row[0]?>" onclick="if(!this.checked)this.parentNode.parentNode.style.background='#fff'"<?php if($row[21]==0)echo' disabled="disabled"'?> />
    </td>
  </tr>
<?php
	}
?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="14" align="center"><?php $page->show_guide()?></td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="14" align="center">
	<?php
		echo $button;
	?>
    <input name="button" type="button" onclick="<?php if($t=='w'){ ?>command('?c=amend','',1)<?php }else{ ?>command('?c=amend')<?php } ?>" value=" 修 改 " />　
	<input type="button" value=" 删 除 " onclick="<?php if($t=='w'){ ?>window.remove('?c=remove',1)<?php }else{ ?>window.remove('?c=remove',0)<?php } ?>" />　
	<?php
		if(check_function(array(47,54,56))){
	?>
	<input type="button" onclick="selectCheck('reverse')" value=" 反 选 " />　
	<input type="button" onclick="selectCheck('all')" value=" 全 选 " />
	<?php
		}
		if(check_function(58)){
			if($t=='c'){
				if($order_type==0){
	?>
		　<select id="output_command">
			<option value="">选择一种报表将全部结果导出</option>
			<option value="send_workbook">发货记录报表</option>
			<option value="express_order_workbook">已发货订单报表</option>
		  </select>
		  <input type="button" id="output_button" value=" 导 出 " onclick="if($('output_command').value!='')window.open('excel.php?c='+$('output_command').value+'<?php echo $w?>')" />
	<?php
				}
			}
		}
	?>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="14" align="center" id="organ_list">
		<span style="margin-right:10px">机构筛选：</span><?php
			if(empty($db))$db=new db(true,true);
			$organ_result = $db->query("select id,name from organ where is_valid=1".get_check_organ_sql(171,'id'));
			foreach($organ_result as $organ){
				echo '<a href="?c='.$_GET['c'].'&organ_id='.$organ[0].'" style="margin-right:20px'.($organ[0]==$_GET['organ_id']?';color:#f00':'').'">'.$organ[1].'</a>';
			}
		?>
	</td>
  </tr>
</table>
</form>

<div style="margin-top:20px;text-align:left">什么是关联关系、主订单和附属订单？</div>
<div style="margin-top:10px;color:#999;text-align:left;line-height:20px">
	订单分为主订单和附属订单两种，主订单和附属订单之间存在一种关联关系，如果一个客服购买了多种产品，那么我们可以为每种产品分别添加独立的订单，然后把他们关联起来，这样系统既可以正常统计销售，也可以将这些订单的所有货物打包在一起发货。
</div>
<?php
}

function wait_search(){
	check_user();
	$order_type_code=$_POST['order_type_code'];
	$where=' and order_type_code='.$order_type_code;
	wait($where);
}

function wait($order_type_where =''){
	check_user(51);
	if($w=="")$w=$_GET["w"];
	if($order_type_where != "") $w=$order_type_where;
?>
<script>
	function checkForm(){
		if(document.forms[0].elements['order_type_code'].value == ''){
			alert('请选择订单类型');
			return false;
		}
		with(document.forms[0]){
			action="?c=wait_search";
			method="post";
			submit();
		}


	}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">待发货的订单</td>
  </tr>
  <tr>
  	<td style="padding:10px 0 0 50px">
        <form>
            订单类型:
            <select  name="order_type_code"  class="order_type_code">
                <option value="0">货到付款</option>
                <option value="1">款到发货</option>
            </select>
            <input type="button" value=" 筛 选 " onclick="checkForm()" id="btn" style="height:25px;width:70px;margin-right:30px" />
        </form>
    </td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
		<?php send_list('w',$w)?>
	</td>
  </tr>
</table>
<?php
}


function back($w=""){
	check_user(53);
	if($w=="")$w=$_GET["w"];
?>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">待退货的订单</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
		<?php send_list("b",$w)?>
	</td>
  </tr>
</table>
<?php
}

function complete($w="",$order_type=0){
	check_user(55);
	if($w=="")$w=$_GET["w"];
?>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center"><?php
	switch($order_type){
		case 0:
			echo "已发货";
			break;
		case 1:
			echo "不退货";
			break;
		case 2:
			echo "已退货";
			break;
	}
	?>的订单
	</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
		<?php send_list("c",$w,$order_type)?>
	</td>
  </tr>
</table>
<?php
}


function browse_batch_send_list(){

	check_user(206);

	$db = new db(true);

	$express_id = intval($_GET['express_id']);
	$express_array = $db->query('select id,express_name as name,express_ename as ename,is_apart from express where is_valid=1 and is_allow_batch=1');
	foreach($express_array as &$express)$express['name'] = current(explode('-',$express['name']));
	unset($express);

	if(!$express_id){
		$express_id=$express_array[0]['id'];
		$express_is_apart=$express_array[0]['is_apart'];
		$express_ename=$express_array[0]['ename'];
	}else{
		foreach($express_array as $express){
			if($express_id==$express['id']){
				$express_is_apart = $express['is_apart'];
				$express_ename = $express['ename'];
			}
		}
	}

	include_once('include/page.php');
	$sql = 'select * from orderform where ';
	$sql .= 'is_valid=1 and is_allow_send=1 and (order_state_code=300 or order_state_code=400) and is_batch=1 and parent=0 and batch_express_id='.$express_id.get_check_organ_sql(171);


	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

		$user_team_id_array=array_strip($_SESSION['user_team']);
		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

	}
	if($product_list){
		$sql.=" and product_id in (".$product_list.")";
	}

	$sql .= " order by id desc";
	$page = new page($sql);

	$page_result = $page -> get_result(false);


	$max_order_count = $page->get_record_count();

	//如果两中发货类型是分开的，那么分别获取这俩类型的订单数
	if($express_is_apart){
		//获取代收款的数量
		$sql = 'select count(*) from orderform where ';
		$sql .= 'is_valid=1 and is_allow_send=1 and (order_state_code=300 or order_state_code=400) and is_batch=1 and parent=0 and order_type_code=0 and batch_express_id='.$express_id.get_check_organ_sql(171);
		$max_order_count_array = array(
			$db->query($sql,true,true)
		);
		$max_order_count_array[1] = $max_order_count-$max_order_count_array[0];
	}
?>

<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="lodop/LodopFuncs.js"></script>
<script type="text/javascript" src="js/description.js"></script>

<script type="text/javascript">
var isPrinted = 0;
var expressEname = '<?php echo $express_ename?>';
var isApart = <?php echo $express_is_apart?1:0?>;
<?php
	if($express_is_apart){
?>
var max_order_count_array = [<?php echo implode(',',$max_order_count_array)?>];
<?php
	}
?>

var organ_name = '<?php echo get_organ_info('name')?>';
var order_list;
var order_id_array = [];
var order_express_code_array = [];
function get_choosed_order_id(){
	var order_id_array = [];
	var inputList = document.forms[0].getElementsByTagName('input');
	for(var i=0;i<inputList.length;i++){
		if(inputList[i].type=='checkbox'){
			if(inputList[i].checked){
				order_id_array.push(inputList[i].value);
			}
		}
	}
	return order_id_array;
}

function get_batch_send_max_order_count(t){
	$('max_order_count').innerHTML = max_order_count_array[t];
	check_order_count();
}

function check_order_count(){
	$('order_count').value = $('order_count').value.replace(/\D/g,'');
	if($('order_count').value=='')$('order_count').value='0';
	if(parseInt($('order_count').value)>parseInt($('max_order_count').innerHTML))$('order_count').value = $('max_order_count').innerHTML;
	$('order_count').value = parseInt($('order_count').value);
	build_order_code();
}

function build_order_code(){
	var start_express_code = $('start_express_code').value;
	$('start_express_code').value = start_express_code.replace(/\W/g,'');
	$('order_code_list').length=0;
	order_express_code_array = [];
	if(start_express_code.length>8){
		var start_number = '';
		for(var i=start_express_code.length-1;i>=0;i--){
			if(!/\d/.test(start_express_code.charAt(i)))break;
			start_number += start_express_code.charAt(i);
		}
		if(start_number=='')return;
		start_number=start_number.split('').reverse().join('');
		var prefix = start_express_code.substr(0,start_express_code.length-start_number.length);
		for(var i=0,code;i<parseInt($('order_count').value);i++){
			code = (parseInt(start_number)+i).toString();
			while(code.length<start_number.length)code='0'+code;
			code = prefix+code;
			order_express_code_array.push(code);
		}
	}
	$('order_code_list').value = order_express_code_array.join('\n');
}


window.onload=function(){
	var bg = document.createElement('div');
	var win = document.createElement('div');
	bg.id = 'bg';
	win.id = 'win';
	bg.style.cssText = 'position:absolute;left:0;top:0;background:url(../images/bg.gif);display:none';
	win.style.cssText = 'position:absolute;left:0;top:0;border:5px solid #ddd;padding:10px 20px;background:#fff;display:none';
	win.innerHTML = '\
		<div style="font-weight:bold;padding-bottom:5px;padding-left:5px;border-bottom:1px solid #ccc;font-size:16px">设置订单数量和单号</div>\
		<div style="margin-top:10px">\
			<?php
				if($express_is_apart){
			?><div style="margin-bottom:10px">选择货款类型：<label><input type="radio" name="express_type" id="express_type_0" onclick="get_batch_send_max_order_count(0)" />代收款</label><label><input type="radio" name="express_type" id="express_type_1" onclick="get_batch_send_max_order_count(1)" />非代收款</label></div>\
			<?php
				}
			?>
			<div>输入起始单号：<input type="text" size="20" id="start_express_code" maxlength="15" /></div>\
			<div style="margin-top:10px">输入发货订单数：<input type="text" size="6" id="order_count"/> / <span style="color:#f60;font-weight:bold" id="max_order_count"><?php echo $max_order_count?></span></div>\
			<div style="margin-top:10px">发货单号列表：<textarea rows="4" cols="41" id="order_code_list" style="vertical-align:top;font-size:12px;overflow:auto"></textarea><span style="color:#ccc">[一行一个]</span></div>\
		</div>\
		<div style="margin-top:15px" id="btn_list">\
			<input type="button" value="打印预览" style="height:30px;width:80px" />\
			<input type="button" value="开始打印" style="height:30px;width:80px;margin-left:10px" />\
			<input type="button" value="保 存" style="height:30px;width:80px;margin-left:10px" />\
			<input type="button" value="取 消" style="height:30px;width:80px;margin-left:10px" />\
		</div>\
	';
	document.body.appendChild(bg);

	document.body.appendChild(win);

	$('order_count').onkeyup=$('order_count').onblur=$('start_express_code').onkeyup=$('start_express_code').onblur=check_order_count;

	var btnList = $$$('input','btn_list');
	for(var i=0;i<2;i++){
		btnList[i].onclick=(function(i){
			return function(){printExpressOrder(i)};
		})(i);
	}
	btnList[2].onclick = function(){

		if($('start_express_code').value.length<8){
			alert('请输入正确的起始发货单号！');
			$('start_express_code').select();
			return;
		}

		if($('order_count').value=='' || $('order_count').value=='0'){
			alert('请输入要批量处理发货的订单数量！');
			$('order_count').select();
			return;
		}

		if($('order_code_list').value.split('\n').length!=$('order_count').value){
			alert('单号列表中的数量和输入的数量不一致！');
			return;
		}


		//如果未打印，就点保存则提示
		if(!isPrinted && expressEname.indexOf('shunfeng')==-1){
			alert('请先打印发货单之后再点保存！');
			return;
		}

		if(expressEname.indexOf('shunfeng')>-1){
			order_id_array=get_choosed_order_id();
		}

		var param_array = [
			'express_id=<?php echo $express_id?>'
		];
		for(var i=0;i<order_id_array.length;i++){
			param_array.push('order_id[]='+order_id_array[i]);
		}
		for(var i=0;i<order_express_code_array.length;i++){
			param_array.push('order_express_code[]='+order_express_code_array[i]);
		}

		this.disabled=true;
		execute('post','get.php?c=save_batch_send_order',function(string){
			if(string!='ok'){
				alert(string);
				this.disabled=false;
				return;
			}

			location.reload();

		},param_array.join('&'));

	};
	btnList[3].onclick=hideSetWindow;
	$('show_set_btn').onclick=showSetWindow;
	if(isApart)$('express_type_0').click();
	$('order_code_list').onblur = function(){
		order_express_code_array = $('order_code_list').value.split(/\r?\n/);
	};
};


function showSetWindow(){

	if(!<?php echo $page->get_record_count()?>){
		alert('没有任何要发货的订单！');
		return;
	}
	isPrinted = 0;
	var width = document.documentElement.scrollWidth<document.documentElement.clientWidth?document.documentElement.clientWidth:document.documentElement.scrollWidth;
	var height = document.documentElement.scrollHeight<document.documentElement.clientHeight?document.documentElement.clientHeight:document.documentElement.scrollHeight;
	var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	$('bg').style.display = '';
	$('bg').style.width = width+'px';
	$('bg').style.height = height+'px';
	$('win').style.display = '';
	$('win').style.left = scrollLeft + ((document.documentElement.clientWidth-$('win').clientWidth-100)>>1) + 'px';
	$('win').style.top = scrollTop + ( ((document.documentElement.clientHeight-$('win').clientHeight-100)>>1)+50 ) + 'px';

}

function hideSetWindow(){
	$('bg').style.display = 'none';
	$('win').style.display = 'none';
}

//t:0预览 1打印
function printExpressOrder(t){

	if($('start_express_code').value.length<8){
		alert('请输入正确的起始发货单号！');
		$('start_express_code').select();
		return;
	}

	if($('order_count').value=='' || $('order_count').value=='0'){
		alert('请输入要批量处理发货的订单数量！');
		$('order_count').select();
		return;
	}

	if($('order_code_list').value.split('\n').length!=$('order_count').value){
		alert('单号列表中的数量和输入的数量不一致！');
		return;
	}

	isPrinted = 1;

	LODOP=getLodop();
	LODOP.PRINT_INITA(-14,-27,1123,794,"打印快递单");
	LODOP.SET_PRINT_PAGESIZE(1,2290,1267,"");
	LODOP.SET_PRINT_STYLE("FontSize",12);
	//LODOP.SET_PRINT_STYLE("Bold",1);

	var btnList = $$$('input','btn_list');
	for(var i=0;i<btnList.length;i++)btnList[i].disabled=true;

	if(!order_list){
		//先根据设置的打印数量，加载数据
		execute('post','get.php?c=get_batch_send_order',function(string){
			try{
				eval('order_list='+string);
			}catch(e){
				alert(string);
				return;
			}
			executePrint(t);
		},'express_id=<?php echo $express_id?>&order_count='+$('order_count').value<?php
			if($express_is_apart)echo '+\'&order_type=\'+($(\'express_type_0\').checked?0:1)';
		?>);
	}else{
		executePrint(t);
	}

}


function executePrint(t){
	//遍历所有返回的订单
	for(var i=0;i<order_list.length;i++){

		LODOP.NewPage();

		var order = order_list[i];
		var express = {};
		switch(true){

			//邮政
			case expressEname.indexOf('youzheng')>-1:

				if(organ_name=='舒卫能'){
					express['sender_name'] = '常克华';
					express['sender_company_code'] = '37010104132000';
					express['sender_address'] = '山东省济南市历城区花园路3号（华能）';
					express['sender_phone'] = '156 6574 0460';
				}else{
					express['sender_name'] = '赵大鹏';
					express['sender_address'] = '济南市二环北路1188号';
					express['sender_company'] = '友道';
					express['sender_company_code'] = '0171';
				}

				LODOP.ADD_PRINT_SETUP_BKIMG("<img border='0' src='template/youzheng-hebei/order.jpg'>");

				LODOP.ADD_PRINT_TEXTA("sender_name",104,119,97,25,express['sender_name']||'');
				LODOP.ADD_PRINT_TEXTA("sender_company",126,126,106,25,express['sender_company']||'');
				LODOP.ADD_PRINT_TEXTA("sender_address",149,107,323,25,express['sender_address']||'');
				LODOP.ADD_PRINT_TEXTA("sender_phone",101,274,125,25,express['sender_phone']||'');
				LODOP.ADD_PRINT_TEXTA("sender_company_code",126,320,130,25,express['sender_company_code']||'');
				LODOP.ADD_PRINT_TEXTA("getter_name",216,119,122,25,order['guest_name']);
				LODOP.ADD_PRINT_TEXTA("getter_region",257,109,246,25,order['guest_region_name']);
				LODOP.ADD_PRINT_TEXTA("getter_address",281,76,367,45,order['guest_address']);
				LODOP.ADD_PRINT_TEXTA("getter_phone",216,278,173,24,order['phone']);

				//如果是代收款
				if(!order_list['order_type_code']){
					LODOP.ADD_PRINT_TEXTA("is_money_sign",140,460,32,25,"√");
					LODOP.ADD_PRINT_TEXTA("lower_money",145,532,81,25,order['coll_money']);
					LODOP.ADD_PRINT_TEXTA("upper_money",174,458,163,25,order['coll_upper_money']);
					LODOP.ADD_PRINT_TEXTA("content",380,73,378,56,order['product']);LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
				}


				LODOP.ADD_PRINT_TEXTA("sign0",63,669,105,37,"已验视");LODOP.SET_PRINT_STYLEA(0,"FontSize",23);

				if(organ_name!='舒卫能'){
					LODOP.ADD_PRINT_TEXTA("sign1",31,206,192,55,"全程陆运");LODOP.SET_PRINT_STYLEA(0,"FontSize",34);
				}
				LODOP.ADD_PRINT_TEXTA("express_person",420,455,85,25,express['express_person']||'');
				LODOP.ADD_PRINT_TEXTA("is_goods_sign",415,150,85,25,"√");
				LODOP.ADD_PRINT_TEXTA("organ_id",7,46,85,25,order['organ_id']);

			break;

			//圆通
			case expressEname.indexOf('yuantong')>-1:
				if(organ_name=='舒卫能'){
					express['sender_name'] = '常克华';
					express['sender_address'] = '山东省济南市历城区花园路3号';
					express['sender_phone'] = '156 6574 0460';
				}else{
					express['sender_name'] = '赵大鹏';
					express['sender_region'] = '济南';
				}
				if(isApart){

					//如果代收款
					if($('express_type_0').checked){

						//圆通代收
						LODOP.ADD_PRINT_SETUP_BKIMG("<img border='0' src='template/yuantong-daishou/order.jpg'>");
						LODOP.ADD_PRINT_TEXTA("sender_name",109,100,97,25,express['sender_name']||'');
						LODOP.ADD_PRINT_TEXTA("sender_region",110,267,141,25,express['sender_region']||'');
						LODOP.ADD_PRINT_TEXTA("sender_phone",217,159,158,25,express['sender_phone']||'');
						LODOP.ADD_PRINT_TEXTA("sender_address",170,100,323,25,express['sender_address']||'');
						LODOP.ADD_PRINT_TEXTA("getter_name",109,479,122,25,order['guest_name']);
						LODOP.ADD_PRINT_TEXTA("getter_region",157,469,246,25,order['guest_region_name']);
						LODOP.ADD_PRINT_TEXTA("getter_address",178,428,352,45,order['guest_address']);
						LODOP.ADD_PRINT_TEXTA("getter_phone",217,505,173,24,order['phone']);
						LODOP.ADD_PRINT_TEXTA("is_money_sign",266,428,32,25,"√");
						LODOP.ADD_PRINT_TEXTA("lower_money",275,700,81,25,order['coll_money']);
						LODOP.ADD_PRINT_TEXTA("upper_money",270,490,169,25,order['coll_upper_money']);
						LODOP.ADD_PRINT_TEXTA("content",280,55,180,132,order['product']);LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
						LODOP.ADD_PRINT_TEXTA("organ_id",7,57,85,25,order['organ_id']);
						LODOP.ADD_PRINT_TEXTA("express_user_id",427,35,100,25,'00283489');
						LODOP.ADD_PRINT_TEXTA("express_type",205,325,100,40,'汽');LODOP.SET_PRINT_STYLEA(0,"FontSize",46);

					}else{

						//圆通非代收
						LODOP.ADD_PRINT_SETUP_BKIMG("<img border='0' src='template/yuantong-putong/order.jpg'>");
						LODOP.ADD_PRINT_TEXTA("sender_name",103,124,97,25,express['sender_name']||'');
						LODOP.ADD_PRINT_TEXTA("sender_phone",212,159,158,25,express['sender_phone']||'');
						LODOP.ADD_PRINT_TEXTA("sender_address",170,100,323,25,express['sender_address']||'');
						LODOP.ADD_PRINT_TEXTA("getter_name",103,479,122,25,order['guest_name']);
						LODOP.ADD_PRINT_TEXTA("getter_region",143,466,246,25,order['guest_region_name']);
						LODOP.ADD_PRINT_TEXTA("getter_address",166,423,357,51,order['guest_address']);
						LODOP.ADD_PRINT_TEXTA("getter_phone",214,511,173,24,order['phone']);
						LODOP.ADD_PRINT_TEXTA("content",300,67,161,132,order['product']);LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
						LODOP.ADD_PRINT_TEXTA("organ_id",7,46,85,25,order['organ_id']);

					}
				}
			break;

			//未知的快递
			default:
				alert('未知的快递，请与管理员联系！');
				return;
			break;
		}

		order_id_array.push(order['id']);

	}

	//创建完毕
	if(t){
		LODOP.PRINT();
	}else{
		LODOP.SET_SHOW_MODE("BKIMG_PRINT",1);
		LODOP.PREVIEW();
	}

	var btnList = $$$('input','btn_list');
	for(var i=0;i<btnList.length;i++)btnList[i].disabled=false;

}

</script>

<style type="text/css">
	.tab_menu{background:#ccc;line-height:35px;height:35px;border-radius:5px}
	.tab_menu ul{position:absolute;line-height:25px;margin-top:4px}
	.tab_menu ul li{display:block;margin-left:20px;float:left;cursor:pointer;background:#ddd;border-radius:5px 5px 0 0;}
	.tab_menu ul li a{color:#999;text-decoration:none;display:block;padding:3px 20px;}
	.tab_menu ul li.focus{background:#fff;cursor:auto}
	.tab_menu ul li.focus a{font-weight:bold;color:#666}
	.tab_item{display:none}
</style>

<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">批量待发货的订单</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">

<div class="tab_menu">
	<ul>
		<?php
			foreach($express_array as $express){
		?>
		<li<?php echo $express['id']==$express_id?' class="focus"':''?>><a href="?<?php echo get_query_param(array('express_id'=>$express['id']))?>"><?php echo $express['name']?></a></li>
		<?php
			}
		?>
	</ul>
	<input type="button" value="批量发货" style="position:absolute;right:10px;height:30px;margin-top:3px;margin-right:5px;width:120px;" id="show_set_btn" />
</div>
<p style="clear:both"></p>

<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" style="margin-top:10px">
  <tr bgcolor="#f3f3f3">
    <td width="4%" height="30" align="center"><strong>序列</strong></td>
    <td width="9%" align="center"><strong>订单编号</strong></td>
    <td width="7%" align="center"><strong>客服姓名</strong></td>
    <td width="7%" align="center"><strong>产品名称</strong></td>
    <td width="8%" align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
    <td width="6%" align="center"><strong>客户姓名</strong></td>
    <td width="8%" align="center"><strong>客户地区</strong></td>
    <td width="18%" align="center"><strong>收货地址</strong></td>
    <td width="9%" align="center"><strong>联系方式</strong></td>
    <td width="13%" align="center"><strong>订单备注</strong></td>
	<td width="9%" align="center"><strong>关联关系</strong></td>
    <td width="4%" align="center"><strong>选择</strong></td>
  </tr>
<?php
	foreach($page_result as $key => $row){
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center"><a href="?c=amply&order_id=<?php echo $row['id']?>"><?php echo $row['order_code']?></a></td>
    <td align="center"><a href="user.php?c=amply&user_id=<?php echo $row['addition_id']?>"><?php echo $row['addition_name']?></a></td>
    <td align="center">
	<?php
		$gift_sql = 'select product_id,product_name,gift_type from gift where order_id='.$row['id'].' and gift_type=1';
		$gift_list = $page -> db -> query($gift_sql,'assoc');
		foreach($gift_list as $gift){
	?>
	<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift['product_id']?>"><?php echo $gift['product_name']?></a></div>
	<?php
		}
	?>
	</td>
  <td align="center"><?php if($row['order_type_code'] == 0){echo  (round($row['order_money'],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($row['reserve_money'],1).'</span>+<span style="color:red">'.(round($row['pay_money'],1) ? round($row['pay_money'],1) : round($row['order_money'],1))).'</span>)</span>');}else{echo round($row['order_money'],1);}?></td>
    <td align="center"><a href="guest.php?c=amply&guest_id=<?php echo $row['guest_id']?>"><?php echo $row['guest_name']?></a></td>
    <td align="center"><?php echo round_region($row['guest_region_name'])?></td>
    <td align="center"><?php echo $row['guest_address']?></td>
    <td align="center"><?php echo $row['guest_contact']?></td>
    <td align="center"><?php echo $row['order_intro']?></td>
    <td align="center"><?php echo $row['parent']?'<span style="color:#ccc">附属订单</span>':'主订单'?></td>
    <td align="center">
    <input type="checkbox" name="ChooseCheck[]" value="<?php echo $row['id']?>" onclick="if(!this.checked)this.parentNode.parentNode.style.background='#fff'"<?php if($row['is_valid']==0)echo' disabled="disabled"'?> />
    </td>
  </tr>
<?php
	}
?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="13" align="center"><?php $page->show_guide()?></td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="13" align="center">

		<input name="button" type="button" onclick="command('?c=remove_batch_order')" value="移 除" />　

		<?php
			if(check_function(array(47,54,56))){
		?>
		<input type="button" onclick="selectCheck('reverse')" value=" 反 选 " />　
		<input type="button" onclick="selectCheck('all')" value=" 全 选 " />
		<?php
			}
		?>
	</td>
  </tr>
</table>
</form>




	</td>
  </tr>
</table>
<?php
}

function remove_batch_order(){

	check_user();
	$db = new db(true);
	$time = get_time();
	$order_id_array = get_selected(true);
	if(!count($order_id_array)){
        $order_id_array[] = $_GET["order_id"];
	}

	$order_id_string = implode(',',$order_id_array);

	if($order_id_array){
		$db->update('orderform',array(
			'is_batch'	=>	0,
			'sender_id' =>  0,
			'sender_name' => '',
			'order_state_code'=>300,
			'order_state_name'=>'等待发货部处理发货'
		),'id in('.$order_id_string.')');
	}

	include("include/guide.php");
	$guide = new guide();
	$guide -> set_message("移除完成！");
    $guide -> append("批量待发货订单列表",$_SERVER['HTTP_REFERER']);
    $guide -> append("待发货订单列表","order.php?c=wait");
	$guide -> out();

}





function search_send(){
	check_user(57);
	$is_express_id = $_POST["is_express_id"];
	$is_send_order_code = $_POST["is_send_order_code"];
	$is_order_type = $_POST["is_order_type"];
	$is_guest_name = $_POST["is_guest_name"];
	$is_send_date = $_POST["is_send_date"];
	$is_return_date = $_POST["is_return_date"];
	$is_send_person = $_POST["is_send_person"];
	$is_return_person=$_POST['is_return_person'];
	$is_order_delete_state = $_POST["is_order_delete_state"];
	$where_array = array();
	if($is_express_id){
		$express_id = $_POST["express_id"];
		if($express_id=="all"){
			array_push($where_array,"express_id>0");
		}else{
			array_push($where_array,"express_id=".$express_id);
		}
	}
	if($is_send_order_code){
		array_push($where_array,"express_order_code='".$_POST["send_order_code"]."'");
	}
	if($is_guest_name){
		array_push($where_array,"guest_name='".$_POST["guest_name"]."'");
	}
	if($is_send_date){
		array_push($where_array,"send_time>='".$_POST["begin_date"]."'");
		array_push($where_array,"send_time<='".$_POST["end_date"]." 23:59:59'");
	}
	if($is_return_date){
		array_push($where_array,"return_sender_time>='".$_POST["return_begin_date"]."'");
		array_push($where_array,"return_sender_time<='".$_POST["return_end_date"]." 23:59:59'");
	}
	if($is_send_person){
		array_push($where_array,"sender_id=".$_POST["send_person"]);
	}
	if($is_return_person){
		array_push($where_array,"return_sender_id=".$_POST["return_person"]);
	}
	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){
		$db=new db(true);
		$user_team_id_array=array_strip($_SESSION['user_team']);
		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

	}


	if($product_list){
		array_push($where_array,"product_id in (".$product_list.")");
	}


	foreach($where_array as $key => $value){
		$where .= " and ".$value;
	}
	if($is_order_type){
		$order_type = $_POST["order_type"];
	}else{
		$order_type = 0;
	}
	if($order_type!=1){
		if($is_order_delete_state){
			$where .= " and is_valid=".$_POST["order_delete_state"];
		}
	}

	switch($order_type){
		case 0:
			complete(encode($where));
			break;
		case 1:
			back(encode($where));
			break;
		case 2:
			complete(encode($where),1);
			break;
		case 3:
			complete(encode($where),2);
			break;
	}
}

function search_send_term(){
	check_user(57);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
	function checkForm(){
		var checkList = ["is_express_id","is_send_order_code","is_order_type","is_guest_name","is_send_date","is_return_date","is_send_person","is_return_person","is_order_delete_state"];
		var alertList = ["选择快递公司","输入发货单号",,"输入客户姓名",,"请选择发货处理人","请选择退货处理人"];
		var choosedList = [];
		var isExists = false;
		for(var i=0;i<checkList.length;i++){
			if(document.forms[0].elements[checkList[i]].checked){
				var checkName = checkList[i].replace("is_","");
				isExists = true;
				choosedList.push([checkName,i]);
			}
		}
		if(isExists){
			for(var i=0;i<choosedList.length;i++){
				if(choosedList[i][0]=="send_date"){
					var beginDate = document.forms[0].elements["begin_date"].value;
					var endDate = document.forms[0].elements["end_date"].value;
					if(beginDate==""){
						alert("请选择开始始时间！");
						return;
					}
					if(endDate==""){
						alert("请选择结束时间！");
						return;
					}
					beginDateArray = beginDate.split("-");
					beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
					endDateArray = endDate.split("-");
					endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
					if(Date.parse(beginDate)>Date.parse(endDate)){
						alert("开始时间不能大于结束时间！");
						return;
					}
				}else if(choosedList[i][0]=="return_date"){
                    var beginDate = document.forms[0].elements["return_begin_date"].value;
					var endDate = document.forms[0].elements["return_end_date"].value;
					if(beginDate==""){
						alert("请选择开始始时间！");
						return;
					}
					if(endDate==""){
						alert("请选择结束时间！");
						return;
					}
					beginDateArray = beginDate.split("-");
					beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
					endDateArray = endDate.split("-");
					endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
					if(Date.parse(beginDate)>Date.parse(endDate)){
						alert("开始时间不能大于结束时间！");
						return;
					}

				}else{
					if(document.forms[0].elements[choosedList[i][0]].value==""){
						alert("请"+alertList[choosedList[i][1]]+"！");
						return;
					}
				}
			}
			with(document.forms[0]){
				action = "?c=search_send";
				method = "post";
				submit();
			}
		}else{
			alert("请至少选择一个筛选条件！");
		}
	}

	window.onload=function(){

		autoChoose({

			'begin_date'		:	'send_date',
			'end_date'			:	'send_date',
			'return_begin_date'	:	'return_date',
			'return_end_date'	:	'return_date'



		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">已发货订单筛选器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司：</strong></td>
    <td align="left">
	<select name="express_id">
	<option value="all">所有快递公司</option>
	<?php
		$db = new db(true);
		$result = $db -> query("select id,express_name from express where is_valid=1".get_check_organ_sql(172)." order by order_index asc,id asc");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_order_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货单号：</strong></td>
    <td align="left"><input name="send_order_code" type="text" id="send_order_code" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_type" id="is_order_type" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单状态：</strong></td>
    <td width="75%" align="left">
	<select name="order_type" id="order_type">
		<option value="0">已发货的订单</option>
		<option value="1">待退货的订单</option>
		<option value="2">不退货的订单</option>
		<option value="3">已退货的订单</option>
    </select>
	(已发货的订单包括所有走过发货流程的订单)
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_name" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="75%" align="left"><input name="guest_name" type="text" id="guest_name" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td width="75%" align="left"><input name="begin_date" type="text" id="begin_date" onclick="showCalendar('begin_date','%Y-%m-%d',false,false,'begin_date')" size="10" readonly="true"/> — <input name="end_date" type="text" id="end_date" onclick="showCalendar('end_date','%Y-%m-%d',false,false,'end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_return_date" value="true" /></td>

    <td height="30" align="center" bgcolor="#f3f3f3"><strong>退货时间：</strong></td>
    <td width="75%" align="left"><input name="return_begin_date" type="text" id="return_begin_date" onclick="showCalendar('return_begin_date','%Y-%m-%d',false,false,'return_begin_date')" size="10" readonly="true"/> — <input name="return_end_date" type="text" id="return_end_date" onclick="showCalendar('return_end_date','%Y-%m-%d',false,false,'return_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_send_person"  type="checkbox" id="is_send_person" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货处理人：</strong></td>
    <td width="75%" align="left">
	<select name="send_person">
	<option value="">请选择发货处理人</option>
	<?php
		$result = $db -> query("select id,name from user where (group_id=0 or group_id=5) and is_valid=1");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\" >".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_return_person" type="checkbox" id="is_return_person" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>退货处理人：</strong></td>
    <td width="75%" align="left">
	<select name="return_person">
	<option value="">请选择退货处理人</option>
	<?php
		$result = $db -> query("select id,name from user where (group_id=0 or group_id=5) and is_valid=1");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_delete_state" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单删除状态：</strong></td>
    <td width="75%" align="left">
		<select name="order_delete_state">
			<option value="1">未删除的订单</option>
			<option value="0">已删除的订单</option>
		</select>
		(待退货的订单类型无效)
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 筛 选 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>	</td>
  </tr>
</table>
<?php
}

function finance_list($t="",$where_order_state_code='200'){
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">
  <tr bgcolor="#f3f3f3">
    <td height="30" align="center"><strong>序列</strong></td>
    <td align="center"><strong>订单编号</strong></td>
	<?php
		if($t=="goods"){
	?>
    <td align="center"><strong>快递信息</strong></td>
	<?php
		}
	?>
    <td align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
    <td align="center"><strong>客服姓名</strong></td>
    <td align="center"><strong>客户姓名</strong></td>
    <td align="center"><strong>支付方式</strong></td>
	<?php
		if($t=="money"){
	?>
    <td align="center"><strong>支付信息</strong></td>
	<?php
		}
	?>
    <td align="center"><strong>添加日期</strong></td>
    <td align="center"><strong>关联关系</strong></td>
    <td align="center"><strong>选择</strong></td>
    </tr>
<?php
	include_once("include/page.php");
	$sql = "select id,order_code,order_name,order_money,addition_id,addition_name,addition_phone,guest_id,guest_name,order_type_name,money_expect_time,money_bank_name,money_bank_code,add_time,express_name,express_order_code,parent,express_status,reserve_money,pay_money,order_type_code from orderform where is_valid=1 and order_state_code=$where_order_state_code and ";
	$where = $_GET["w"];
	$page_param = "c=".$t;
	if(empty($where)){
		$sql .= "order_type_code=".($t=="goods"?"0":"1");
	}else{
		$sql .= encode($where,false);
		//$page_param.="&w=".$where;
	}
	$sql .= get_check_organ_sql(171);
	$href_param = get_common_param()."&sr".$page_param;

	$page_param = $page_param.'&'.get_common_param(FALSE,FALSE);

	if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){
		$db=new db(true);


		$user_team_id_array=array_strip($_SESSION['user_team']);
		$user_team_id_str=implode(',',$user_team_id_array);

		$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

		$product_list=implode(',',array_strip($product_array));

	}


	if($product_list){
		$sql .= " and product_id in (".$product_list.")";
	}



	$sql .= ' order by id desc';

	$page = new page($sql,$page_param);
	$page_result = $page -> get_result();
	foreach($page_result as $key => $row){
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center"><a href="order.php?c=amply&order_id=<?php echo $row[0]?>"><?php echo $row[1]?></a></td>
	<?php
		if($t=="goods"){
	?>
    <td align="center"><?php
		if($row['express_name']){
			if(strpos($row['express_name'],'-')!==FALSE)$row['express_name']=current(explode('-',$row['express_name']));
			echo $row['express_name'].'：'.$row['express_order_code'];
			$express_status = $row['express_status'];
			if(is_numeric($express_status)){
				echo '<span style="color:#'.$express_status_pointer[$express_status]['color'].';margin-left:5px">['.$express_status_pointer[$express_status]['name'].']</span>';
			}
		}else{
			if($row['assign_express_name'])echo '<span style="color:#ccc">'.$row['assign_express_name'].'</span>';
		}
	?></td>
	<?php
		}
	?>

    <td align="center"><?php if($row[20] == 0){echo  (round($row[3],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($row[18],1).'</span>+<span style="color:red">'.(round($row[19],1)?round($row[19],1):round($row[3],1))).'</span>)</span>');}else{echo round($row[3],1);}?></td>
    <td align="center"><a href="user.php?c=amply&user_id=<?php echo $row[4]?>"><?php echo $row[5]?></a></td>
    <td align="center"><a href="guest.php?c=amply&guest_id=<?php echo $row[7]?>"><?php echo $row[8]?></a></td>
    <td align="center"><?php echo $row[9]?></td>
	<?php
		if($t=="money"){
	?>
    <td align="center">
	<?php
		if($row[10]!=""){
			echo "预计到款时间：".$row[10]."<br />";
		}
		if($row[11]!=""){
			echo "支付银行名称：".$row[11]."<br />";
		}
		if($row[12]!=""){
			echo "支付银行帐号：".$row[12]."<br />";
		}
	?>
	</td>
	<?php
		}
	?>
    <td align="center"><?php echo $row[13]?></td>
    <td align="center"><?php echo $row['parent']?'<span style="color:#ccc">附属订单</span>':'主订单'?></td>
    <td align="center"><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row[0]?>" /></td>
    </tr>
	<?php
		}
	?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="12" align="center"><?php $page->show_guide()?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="12" align="center">
	        <?php
        if( $where_order_state_code =='150'){
        ?>
        <input type="button" value="已收到订金" onclick="command('?c=reserve_money_finance&<?php echo $href_param?>')" />
        <?php }else{?>
		<input type="button" value="已收到款" onclick="command('?c=finance&<?php echo $href_param?>')" />　
		        <?php }?>

		<?php
			if($t=="goods" && $where_order_state_code !='150'){
		?>
		<input type="button" value="需要退货" onclick="command('?c=cancel&<?php echo $href_param?>')" />
		<?php
			}
		?>
	</td>
  </tr>
</table>
</form>
<?php
}

//待确认订金订单
function reserve_money(){
    check_user(235);
    ?>
    <table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
        <tr>
            <td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">待确认订金的订单列表</td>
        </tr>
        <tr>
            <td align="center" style="padding:10px">
                <?php finance_list("goods",150)?>
            </td>
        </tr>
    </table>
    <?php
}

//确认订金到款
function reserve_money_finance(){
    check_user(236);
    global $db;
    $db = new db(true);
    include 'include/guide.php';
    $guide = new guide();

    $order_id = $_GET["order_id"];
    if(!isset($order_id))$order_id = get_selected(false,1);

    $offset = $_GET["offset"];
    $src = $_GET["src"];
    $w = $_GET["w"];
    $param = "offset=".$offset.'&w='.$w.'&src='.$src;

    //主订单
    $order = $db->query('select order_money,pay_money,parent,order_type_code,reserve_money from orderform where id='.$order_id,true,'assoc');

    /*
    if($order['parent']){
        $guide -> set_message("对不起，该订单是附属订单，不需要单独处理到款，在处理主订单的时候附属订单会一同处理！",true);
        $guide -> append("货到付款的订单","?".str_replace('src','c',$param));
        $guide -> append("款到发货的订单","?c=money");
        $guide -> out();
    }
    */

    //附属订单id
    //$child_order_id_array = get_relate_order_id($order_id,FALSE);
    //$relate_order_id_array = array_merge(array($order_id),$child_order_id_array);
    //$relate_order_where = get_relate_order_where($relate_order_id_array);

    if($_GET["method"]=="post"){

        $money_manager_id = $_SESSION["user_id"];
        $money_manager_name = $_SESSION["user_name"];

        //$money_fact_count = $_POST["money_fact_count"];

        $money_fact_time = get_time();
        $order_state_code = "300";
        $order_state_name = "等待发货部处理发货";

        //$db -> execute("update orderform set money_manager_id=".$money_manager_id.",money_manager_name='".$money_manager_name."',money_fact_count=order_money,money_fact_time='".$money_fact_time."',order_state_code=".$order_state_code.",order_state_name='".$order_state_name."'".$relate_order_where);
        $db -> execute("update orderform set reserve_money_manager_id=".$money_manager_id.",reserve_money_manager_name='".$money_manager_name."',reserve_money_fact_count=reserve_money,reserve_money_fact_time='".$money_fact_time."',order_state_code=".$order_state_code.",order_state_name='".$order_state_name."' where id=".$order_id);
        $guide -> set_message("处理到款已完成！");


        //记录更新数据的日志数组
        $data_update_logs_array = array();

        //将需要退货的数据加入到更新日志
        $data_update_logs_array['update_orderform'] = array(
            'data'	=>	array(
                'order_state_code'				=>		$order_state_code,
                'order_state_name'				=>		$order_state_name,
                'reserve_money_manager_id'				=>		$money_manager_id,
                'reserve_money_manager_name'			=>		$money_manager_name,
                'reserve_money_fact_time'				=>		$money_fact_time,
            ),
            'where'	=>	array(
                'order_id'	=>	$order_id,
            ),
        );

        //将更新数据写入到日志文件中
        append_update_logs('confirm_order_reserve_money',$data_update_logs_array);

        $guide -> append("货到付款的订单","?c=goods");
        $guide -> append("查看订单详细页","?c=amply&order_id=".$order_id);
        $guide -> out();
    }
    $money_fact_count = $db -> query("select order_money,reserve_money from orderform where id=".$order_id,true,true);
    ?>
    <script type="text/javascript" src="js/element.js"></script>
    <script type="text/javascript" src="js/alert.js"></script>
    <script type="text/javascript">
        function checkForm(){
            with(document.forms[0]){
                if(money_fact_count.value==""){
                    alert('请输入实际到款金额！');
                    return;
                }
                if(!/^\d+(.\d+)?$/.test(money_fact_count.value)){
                    alert('金额必须为数字哦！');
                    return;
                }
                $('sumbit_btn').disabled=true;
                action = "?c=reserve_money_finance&method=post&order_id=<?php echo $order_id?>&<?php echo $param?>";
                method = "post";
                submit();
            }
        }
    </script>
    <table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
        <tr>
            <td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">处理订金到款的订单</td>
        </tr>
        <tr>
            <td align="center" style="padding:10px">
                <form>
                    <table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
                        <tr bgcolor="#ffffff">
                            <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>实际到款金额：</strong></td>
                            <td width="84%" align="left" style="padding:10px">
                                <?php
                                $order_money = round($order['reserve_money'],1);
                                if(count($child_order_id_array)){
                                    $child_order_result = $db->query('select id,order_code,order_money,pay_money,reserve_money from orderform where id in('.implode(',',$child_order_id_array).')','assoc');
                                    ?>
                                    <div style="background:#f6f6f6;padding-left:10px;line-height:30px;">订金金额：<?php echo $order_money?></div>
                                    <div style="margin:10px 0;border:1px solid #f3f3f3;padding:10px;line-height:24px">
                                        <div style="font-weight:bold">附属订单：</div>
                                        <?php
                                        foreach($child_order_result as $child_order){
                                            $child_order_money = round($child_order['reserve_money'],1);
                                            $order_money += $child_order_money;
                                            ?>
                                            <div>订单编号：<a href="?c=ample&order_id=<?php echo $child_order['id']?>" target="_blank"><?php echo $child_order['order_code']?></a><span style="padding-left:20px">订金金额：<?php echo $child_order_money?></span></div>
                                            <?php
                                        }
                                        ?>
                                    </div>
                                    总金额：
                                    <?php
                                }
                                ?>
                                <input type="text" name="money_fact_count" value="<?php echo $order_money?>" readonly="readonly" style="border-width:0;color:#f00" />
                            </td>
                        </tr>
                        <tr bgcolor="#ffffff">
                            <td height="50" colspan="2" align="center">
                                <input type="button" value=" 确 定 " onclick="checkForm()" id="sumbit_btn" />　
                                <input type="reset" value=" 返 回 " onclick="history.back()" />
                            </td>
                        </tr>
                    </table>
                </form>
            </td>
        </tr>
    </table>
    <?php
}

function goods(){
	check_user(59);
?>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">货到付款的订单列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
	<?php finance_list("goods")?>
	</td>
  </tr>
</table>
<?php
}

function money(){
	check_user(60);
?>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">款到发货的订单列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
	<?php finance_list("money")?>
	</td>
  </tr>
</table>
<?php
}


//确认到款
function finance(){
	check_user(63);
	global $db;
	$db = new db(true);
	include 'include/guide.php';
	$guide = new guide();

	$order_id = $_GET["order_id"];
	if(!isset($order_id))$order_id = get_selected(false,1);

	$offset = $_GET["offset"];
	$src = $_GET["src"];
	$w = $_GET["w"];
	$param = "offset=".$offset.'&w='.$w.'&src='.$src;

	//主订单
	$order = $db->query('select order_money,pay_money,parent,order_type_code from orderform where id='.$order_id,true,'assoc');

	/*
	if($order['parent']){
		$guide -> set_message("对不起，该订单是附属订单，不需要单独处理到款，在处理主订单的时候附属订单会一同处理！",true);
		$guide -> append("货到付款的订单","?".str_replace('src','c',$param));
		$guide -> append("款到发货的订单","?c=money");
		$guide -> out();
	}
	*/

	//附属订单id
	//$child_order_id_array = get_relate_order_id($order_id,FALSE);
	//$relate_order_id_array = array_merge(array($order_id),$child_order_id_array);
	//$relate_order_where = get_relate_order_where($relate_order_id_array);

	if($_GET["method"]=="post"){

		$money_manager_id = $_SESSION["user_id"];
		$money_manager_name = $_SESSION["user_name"];

		//$money_fact_count = $_POST["money_fact_count"];

		$money_fact_time = get_time();
		$order_type_code = $order['order_type_code'];
		if($order_type_code){
			$order_state_code = "300";
			$order_state_name = "等待发货部处理发货";
		}else{
			$order_state_code = "700";
			$order_state_name = "已完成";
		}
		//$db -> execute("update orderform set money_manager_id=".$money_manager_id.",money_manager_name='".$money_manager_name."',money_fact_count=order_money,money_fact_time='".$money_fact_time."',order_state_code=".$order_state_code.",order_state_name='".$order_state_name."'".$relate_order_where);
		$db -> execute("update orderform set money_manager_id=".$money_manager_id.",money_manager_name='".$money_manager_name."',money_fact_count=order_money,money_fact_time='".$money_fact_time."',order_state_code=".$order_state_code.",order_state_name='".$order_state_name."' where id=".$order_id);
		$guide -> set_message("处理到款已完成！");


		//记录更新数据的日志数组
		$data_update_logs_array = array();

		//将需要退货的数据加入到更新日志
		$data_update_logs_array['update_orderform'] = array(
			'data'	=>	array(
				'order_state_code'				=>		$order_state_code,
				'order_state_name'				=>		$order_state_name,
				'money_manager_id'				=>		$money_manager_id,
				'money_manager_name'			=>		$money_manager_name,
				'money_fact_time'				=>		$money_fact_time,
			),
			'where'	=>	array(
				'order_id'	=>	$order_id,
			),
		);

		//将更新数据写入到日志文件中
		append_update_logs('confirm_order_money',$data_update_logs_array);



		if($src=="goods"){
			$guide -> append("货到付款的订单","?".str_replace('src','c',$param));
			$guide -> append("款到发货的订单","?c=money");
		}else{
			$guide -> append("款到发货的订单","?".str_replace('src','c',$param));
			$guide -> append("货到付款的订单","?c=goods");
		}
		$guide -> append("查看订单详细页","?c=amply&order_id=".$order_id);
		$guide -> out();
	}
	$money_fact_count = $db -> query("select order_money from orderform where id=".$order_id,true,true);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
		if(money_fact_count.value==""){
			alert('请输入实际到款金额！');
			return;
		}
		if(!/^\d+(.\d+)?$/.test(money_fact_count.value)){
			alert('金额必须为数字哦！');
			return;
		}
		$('sumbit_btn').disabled=true;
		action = "?c=finance&method=post&order_id=<?php echo $order_id?>&<?php echo $param?>";
		method = "post";
		submit();
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">处理到款的订单</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>实际到款金额：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<?php

			$order_money = round($order['pay_money'],1) ? round($order['pay_money'],1) : round($order['order_money'],1);

			if(count($child_order_id_array)){
				$child_order_result = $db->query('select id,order_code,order_money,pay_money from orderform where id in('.implode(',',$child_order_id_array).')','assoc');
		?>
		<div style="background:#f6f6f6;padding-left:10px;line-height:30px;">主订单金额：<?php echo $order_money?></div>
		<div style="margin:10px 0;border:1px solid #f3f3f3;padding:10px;line-height:24px">
			<div style="font-weight:bold">附属订单：</div>
			<?php
				foreach($child_order_result as $child_order){
					$child_order_money = round($child_order['pay_money'],1) ? round($child_order['pay_money'],1) : round($child_order['order_money'],1);
					$order_money += $child_order_money;

			?>
				<div>订单编号：<a href="?c=ample&order_id=<?php echo $child_order['id']?>" target="_blank"><?php echo $child_order['order_code']?></a><span style="padding-left:20px">订单金额：<?php echo $child_order_money?></span></div>

			<?php
				}
			?>
		</div>
		总金额：
		<?php
			}
		?>
		<input type="text" name="money_fact_count" value="<?php echo $order_money?>" readonly="readonly" style="border-width:0;color:#f00" />
	</td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value=" 确 定 " onclick="checkForm()" id="sumbit_btn" />　
		<input type="reset" value=" 返 回 " onclick="history.back()" />
	</td>
    </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function batch(){
	check_user(65);
	global $db;
	$db = new db(true);
	if($_GET["method"]=="post"){
		function filter($string){
			if(preg_match("/^\s*$/",$string)){
				return false;
			}else{
				return true;
			}
		}
		$express_id = $_POST["express_id"];
		$express_order = $_POST["express_order"];
		$type = $_POST["type"];
		$user_id = $_SESSION["user_id"];
		$user_name = $_SESSION["user_name"];
		$money_manager_id = $_SESSION["user_id"];
		$money_manager_name = $_SESSION["user_name"];
		$time = get_time();
		$execute_sql = "update orderform set ";


		$update_values = array();
		$where_values = array();

		if($type){
			$execute_sql .= "return_finance_id=".$user_id.",return_finance_name='".$user_name."',return_finance_time='".$time."',order_state_code=500,order_state_name='等待发货部确认收到退货'";
			$update_values = array(
				'return_finance_id'		=>	$user_id,
				'return_finance_name'	=>	$user_name,
				'return_finance_time'	=>	$time,
				'order_state_code'		=>	500,
				'order_state_name'		=>	'等待发货部确认收到退货',
			);
		}else{
			$execute_sql .= "money_fact_time='".$time."',money_fact_count=order_money,money_manager_id=".$user_id.",money_manager_name='".$user_name."',order_state_code=700,order_state_name='已完成'";
			$update_values = array(
				'money_manager_id'		=>	$user_id,
				'money_manager_name'	=>	$user_name,
				'money_fact_time'		=>	$time,
				'order_state_code'		=>	700,
				'order_state_name'		=>	'已完成',
			);
		}
		$execute_sql .= " where order_type_code=0 and express_id=".$express_id." and express_order_code='";
		$find_sql = "select order_state_code from orderform where express_id=".$express_id." and order_type_code=0".get_check_organ_sql(171)." and express_order_code='";
		$express_order_array = array_filter(explode("\r\n",$express_order),"filter");
		$complete = array();
		$repeat = array();
		$lack = array();
		foreach($express_order_array as $code){
			$code = preg_replace("/\s/","",$code);
			//根据发货单号查询订单
			$search_result = $db -> query($find_sql.$code."'",true);
			//如果有订单
			if(count($search_result)>0){
				//如果状态是等待确认到款，不是说明已经处理过了
				if($search_result[0]==200){
					$db -> execute($execute_sql.$code."'");
					array_push($complete,$code);
					$where_values[] = $code;
				}else{
					array_push($repeat,$code);
				}
			//无订单
			}else{
				array_push($lack,$code);
			}
		}
		$complete_count = count($complete);
		$repeat_count = count($repeat);
		$lack_count = count($lack);
		$intro = "本次操作订单总共[".($complete_count+$repeat_count+$lack_count)."]个<br /><br />";
		$intro .= "操作成功的订单共[".$complete_count."]个：<br />";
		$intro .= "<span>".implode(" | ",$complete)."</span><br /><br />";
		$intro .= "操作失败的订单共[".($repeat_count+$lack_count)."]个：<br /><br />";
		$intro .= "　1、重复确认的订单共[".$repeat_count."]个：<br />　　<span>".implode(" | ",$repeat)."</span><br />";
		$intro .= "　2、不存在的订单共[".$lack_count."]个：<br />　　<span>".implode(" | ",$lack)."</span><br /><br />";
		send_message("批量处理订单详单[".date("Y年n月j日G点i分s秒",get_time("S"))."]","<br />".$intro,$_SESSION["user_id"]);
		$db -> close();


		//记录更新数据的日志数组
		$data_update_logs_array = array();

		//将确认到款的数据加入到更新日志
		$data_update_logs_array['update_orderform'] = array(
			'data'	=>	$update_values,
			'where'	=>	array(
				'express_id'	=>	$express_id,
				'express_code'	=>	$where_values,
			),
		);

		//将更新数据写入到日志文件中
		if(count($where_values))append_update_logs('batch_manage_order',$data_update_logs_array);


		include_once("include/guide.php");
		$guide = new guide();
		$guide -> set_message("批量处理订单完成，系统已将订单处理详情发送到您的信箱，如有需要可以到信箱查看！");

		$guide -> set_auto(FALSE);

		$guide -> set_intro($intro);
		$guide -> append("继续处理订单","?c=batch");
		$guide -> append("货到付款的订单","?c=goods");
		$guide -> append("款到发货的订单","?c=money");
		$guide -> out();
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
		if(express_id.value==""){
			alert("请选择快递公司！");
			return;
		}
		if(express_order.value==""){
			alert("请输入发货单号！");
			return;
		}
		method = "post";
		if($('command0').checked){
			action = "excel.php?c=money_workbook";
			target = "_blank";
		}else{
			if(!confirm('确定要将这些订单处理为：【'+($("type0").checked?"已收到款":"需要退货")+"】吗？"))return;
			action = "?c=batch&method=post";
			target = "_self";
			$('submit_btn').disabled=true;
		}
		submit();
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">财务批量对账处理订单</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司：</strong></td>
    <td width="84%" align="left">
	<select name="express_id">
	<option value="">请选择快递公司</option>
	<?php
		$express_result = $db -> query('select id,express_name,express_person,express_phone from express where is_valid=1 and id<>7'.get_check_organ_sql(172).' order by order_index asc,id asc');
		foreach($express_result as $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>发货单号：</strong></td>
    <td width="84%" align="left"><textarea name="express_order" rows="1" id="express_order" style="overflow:auto;width:160px;height:200px"></textarea></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>操作：</strong></td>
    <td width="84%" align="left">
	<input name="command" type="radio" value="0" id="command0" checked="checked" onclick="$('TypeRow').style.display='none'" /><label for="command0">导出对账报表</label>
	<input type="radio" name="command" value="1" id="command1" onclick="$('TypeRow').style.display=''" /><label for="command1">处理订单</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff" style="display:none" id="TypeRow">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>状态：</strong></td>
    <td width="84%" align="left">
	<input name="type" type="radio" value="0" id="type0" checked="checked" /><label for="type0">已收到款</label>
	<input type="radio" name="type" value="1" id="type1" /><label for="type1">需要退货</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value=" 确 定 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

//处理发货
function send(){
	check_user(52);
	include_once("include/guide.php");
	global $db;
	$db = new db(true);
	$guide = new guide();
	$order_id = $_GET["order_id"];
	if(!isset($order_id))$order_id = get_selected(false,1);
	$user_id = $_SESSION["user_id"];
	$user_name = $_SESSION["user_name"];
	$is_valid = true;
	$order = $check_result = $db -> query("select sender_id,sender_name,order_state_code,is_valid,product_id,product_name,product_unit_count,parent,organ_id,is_sent,is_allow_send,assign_express_id,assign_express_name from orderform where id=".$order_id,true);

	switch(true){
		case $check_result[2]==400&&$check_result[0]<>$user_id:
			$guide -> set_message("对不起，<a href=\"user.php?c=amply&user_id=".$check_result[0]."\">".$check_result[1]."</a>正在处理该订单的发货，请选择其他订单！",true);
			$is_valid = false;
			break;
		case $check_result[3]==0:
			$guide -> set_message("对不起，该订单已被删除，不能发货！",true);
			$is_valid = false;
			break;
		case $check_result['is_sent']==1:
			$guide -> set_message("对不起，该订单已经发过货了！",true);
			$is_valid = false;
			break;
		case $check_result['is_allow_send']==0:
			$guide -> set_message("对不起，该订单不允许发货！",true);
			$is_valid = false;
			break;
	}

	if($is_valid){
		if($order['parent']){
			$guide -> set_message("对不起，该订单是附属订单，不能单独处理发货！",true);
			$is_valid = false;
		}else{
			$gift_product = $db -> query("select product_id,product_name,product_count from gift where order_id=".$order_id." and product_id>0");
			//array_push($gift_product,array($check_result[4],$check_result[5],$check_result[6]));
			foreach($gift_product as $key => $item){
				if(!isset($product_array[$item[0]][0]))$product_array[$item[0]][0] = $item[0];
				if(!isset($product_array[$item[0]][1]))$product_array[$item[0]][1] = $item[1];
				if(!isset($product_array[$item[0]][2])){
					$product_array[$item[0]][2] = $item[2];
				}else{
					$product_array[$item[0]][2] += $item[2];
				}
			}
			if(count($product_array)==0){
				$guide -> set_message("对不起，该订单内没有包含任何产品，不能进行发货操作！",true);
				$is_valid = false;
			}else{

				//发货不判断库存
				/*
				foreach($product_array as $item){
					$stock_count = $db -> query("select stock_count from product where id=".$item[0],true,true);
					if($stock_count<$item[2]){
						$guide -> set_message("对不起，产品[".$item[1]."]剩余库存数量[".$stock_count."]少于发货数量[".$item[2]."]，请通知相关部门及时补货！",true);
						$is_valid = false;
						break;
					}
				}
				*/

			}
		}

		//判断是否符合发货条件
		$relate_order_id_array = get_relate_order_id($order_id);
		$order_where = get_relate_order_where($relate_order_id_array);
		$relate_order_count = count($relate_order_id_array);
		$valid_order_count = $db->query('select count(*) from orderform'.$order_where.' and order_state_code in(300,400)',true,true);
		if($valid_order_count<$relate_order_count){
			$guide -> set_message("对不起，存在关联关系的订单中有".($relate_order_count-$valid_order_count)."个不符合发货条件！",true);
			$is_valid = false;
		}
	}


	if(!$is_valid){
		$guide -> append("待发货订单列表","?c=wait");
		$guide -> append("订单详细内容","?c=amply&order_id=".$order_id);
		$guide -> append("待退货订单列表","?c=back");
		$guide -> out();
	}

	//如果发货人为空，记录正在处理发货状态
	if($check_result[0]=='' && !$_SESSION['is_super']){
		$db -> execute("update orderform set sender_id=".$user_id.",sender_name='".$user_name."',order_state_code=400,order_state_name='<a href=\"user.php?c=amply&user_id=".$user_id."\">".$user_name."</a>正在处理发货'".$order_where);
	}

	if($_GET["method"]=="post"){


		$express_order_code = $_POST["order_code"];
		$express = explode("|",$_POST["express_name"]);
		$express_id = $express[0];
		$express_name = $express[1];
		$express_ename = $express[2];
		if(strpos($express_ename,'-')!==FALSE)$express_ename=current(explode('-',$express_ename));
		$express_person_name = $_POST["express_person"];
		$express_person_phone = $_POST["express_phone"];
		$time = get_time();
		$exists_count = 0;
		$expect_arrive_time = $_POST["expect_arrive_time"];
		if($express_id==7)$express_order_code='';
		if(!empty($express_order_code)){
			$exists_count = $db->query("select count(*) from orderform where is_valid=1 and express_id=".$express_id." and express_id<>7 and express_order_code='".$express_order_code."'",true,true);
		}

		if($exists_count>0){
			$guide -> set_message("对不起，快递公司[".$express_name."]的单号[".$express_order_code."]已经存在，请检查单号是否正确！",true);
			$guide -> append("返回重新处理发货","?c=send&order_id=".$order_id);
		}else{

			$order_result = $db -> query("select id,order_code,product_id,product_name,product_package_count,guest_id,guest_name,guest_region_code,guest_region_name,order_type_code,organ_id from orderform".$order_where,'assoc');

			$order_state_array = array(
				array(200,'等待财务部确认到款'),
				array(700,'已完成'),
			);

			//批量SQL
			$batch_update_order_sql = 'insert orderform(id,express_id,express_name,express_ename,express_person_name,express_person_phone,order_state_code,order_state_name,express_order_code,send_time,expect_arrive_time,is_sent) values';
			$batch_insert_record_sql = 'insert sendrecord(order_id,order_code,product_id,product_name,product_package_count,guest_id,guest_name,guest_region_code,guest_region_name,send_time,express_id,express_name,express_ename,express_order_code,organ_id) values';




			$batch_update_order_values = array();
			$batch_insert_record_values = array();
			foreach($order_result as $order){

				list($order_state_code,$order_state_name) = $order_state_array[$order['order_type_code']];
				$batch_update_order_values[] = "(".$order['id'].",".$express_id.",'".$express_name."','".$express_ename."','".$express_person_name."','".$express_person_phone."',".$order_state_code.",'".$order_state_name."','".$express_order_code."','".$time."','".$expect_arrive_time."',1)";

				$batch_insert_record_values[] = "(".$order['id'].",'".$order['order_code']."',".$order['product_id'].",'".$order['product_name']."',".$order['product_package_count'].",".$order['guest_id'].",'".$order['guest_name']."','".$order['guest_region_code']."','".$order['guest_region_name']."','".$time."',".$express_id.",'".$express_name."','".$express_ename."','".$express_order_code."',".$order['organ_id'].")";


				//记录处理发货的日志数组
				$data_update_logs_array = array();

				//将订单发货的数据加入到更新日志
				$data_update_logs_array['update_orderform'] = array(
					'data'	=>	array(
						'express_id'				=>		$express_id,
						'express_name'				=>		$express_name,
						'express_ename'				=>		$express_ename,
						'order_state_code'			=>		$order_state_code,
						'order_state_name'			=>		$order_state_name,
						'express_order_code'		=>		$express_order_code,
						'sender_id'					=>		$user_id,
						'sender_name'				=>		$user_name,
						'send_time'					=>		$time,
						'is_sent'					=>		1,
					),
					'where'	=>	array(
						'order_id'	=>	$order['id'],
					),
				);

				//将更新数据写入到日志文件中
				append_update_logs('manage_order_send',$data_update_logs_array);


			}

			$batch_update_order_sql .= implode(',',$batch_update_order_values).' on duplicate key update express_id=values(express_id),express_name=values(express_name),express_ename=values(express_ename),express_person_name=values(express_person_name),express_person_phone=values(express_person_phone),order_state_code=values(order_state_code),order_state_name=values(order_state_name),express_order_code=values(express_order_code),send_time=values(send_time),expect_arrive_time=values(expect_arrive_time),is_sent=values(is_sent)';

			$batch_insert_record_sql .= implode(',',$batch_insert_record_values);

			$db->execute($batch_update_order_sql);
			$db->execute($batch_insert_record_sql);


			/*
			$order_state_code = $order_state_array[$order_type_code]['code'];
			$order_state_name = $order_state_array[$order_type_code]['name'];

			$db -> execute("update orderform set express_id=".$express_id.",express_name='".$express_name."',express_ename='".$express_ename."',express_person_name='".$express_person_name."',express_person_phone='".$express_person_phone."',order_state_code=".$order_state_code.",order_state_name='".$order_state_name."',express_order_code='".$express_order_code."',send_time='".$time."',expect_arrive_time='".$expect_arrive_time."',is_sent=1".$order_where);

			$organ_id = $check_result['organ_id'];


			//创建发货记录
			$sql = "insert sendrecord(order_id,order_code,product_name,product_package_count,guest_id,guest_name,guest_region_code,guest_region_name,send_time,express_id,express_name,express_ename,express_order_code,organ_id) values(".$order_id.",'".$order_result[0]."','".$order_result[2]."',".$order_result[3].",".$order_result[4].",'".$order_result[5]."','".$order_result[6]."','".$order_result[7]."','".$time."',".$express_id.",'".$express_name."','$express_ename','".$express_order_code."',$organ_id)";

			//查询出附属订单，拼接SQL语句
			//去掉主订单ID
			array_shift($relate_order_id);
			$child_order_id_array=$relate_order_id;
			if(count($child_order_id_array)){
				//查询所有附属订单
				$child_order_result = $db -> query('select id,order_code,product_package_count,organ_id from orderform'.get_relate_order_where($child_order_id_array));
				//遍历所有附属订单那，拼接 INSERT VALUES
				foreach($child_order_result as $child_order){
					$sql .= ",(".$child_order['id'].",'".$child_order['order_code']."','".$order_result[2]."',".$child_order['product_package_count'].",".$order_result[4].",'".$order_result[5]."','".$order_result[6]."','".$order_result[7]."','".$time."',".$express_id.",'".$express_name."','".$express_order_code."',".$child_order['organ_id'].")";
				}
			}
			$db->execute($sql);

			*/


			/*
			发货不减库存了，添加订单减库存
			foreach($product_array as $item){
				$db -> execute("update product set stock_count=stock_count-".$item[2]." where id=".$item[0]);
			}
			*/

			$guide -> set_message("订单处理发货成功！");

			//给客户发送发货提醒短信
			$short_msg_status = 0;
			if($_POST['is_send_short_msg']){
				$short_msg_data = $db->query('select guest_id,guest_name,express_name,express_order_code as express_code from orderform where id='.$order_id,true);
				$result = send_short_msg_to_guest('send',$short_msg_data);
				if(!$result['status']){
					$intro .= '<div style="color:#093">客户发货提醒短信发送成功！</div>';
					$short_msg_status=1;
				}else{
					$intro .= '<div style="color:#fa3">客户发货提醒短信发送失败！失败原因：'.$result['msg'].($result['status']==2?'，手机号码：'.$result['mobilephone']:'').'</div><div style="color:#ccc">注意：短信的发送成功与否，并不会影响订单的正常发货处理</div>';
					$short_msg_status=2;
				}
			}
			$guide -> set_intro($intro);

			//更新发送短信状态
			if($short_msg_status)$db->execute('update orderform set is_send_express_short_msg='.$short_msg_status.$order_where);

		}

		//清除产品销售数据缓存
		clear_cache('product_sell_data',true);

		$guide -> append("待发货订单列表","?c=wait");
		$guide -> append("订单详细内容","?c=amply&order_id=".$order_id);
		$guide -> append("待退货订单列表","?c=back");
		$guide -> out();
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
		if(express_name.value==""){
			alert("请选择快递公司！");
			return;
		}
		//if(express_name.value.split("|")[0]!=7){
			if(order_code.value==""){
				alert("请输入快递单号！");
				return;
			}
		//}
		if(isExistSpace(order_code.value)){
			alert("快递单号中不允许出现空白字符！");
			return;
		}
		$('submit_btn').disabled=true;
		action = "?c=send&method=post&order_id=<?php echo $order_id?>";
		method = "post";
		submit();
	}
}
function chooseExpress(express){
	if(express=="")express="|||";
	var expressArray = express.split("|");
	with(document.forms[0]){
		//$("order_code_tr").style.display=expressArray[0]==7?"none":"";
		if(expressArray[1].indexOf("市送")>=0){
			order_code.value='1111111';
		}else{
			order_code.value='';
		}
		express_person.value = expressArray[3];
		express_phone.value = expressArray[4];
	}
}
function printOrder(auto){
	with(document.forms[0]){
		if(express_name.value==""){
			alert("请选择快递公司！");
			return;
		}
		var url = "print.php?order_id=<?php echo $order_id?>&express_id="+express_name.value.split("|")[0];
		if(auto)url += "&auto_print="+auto;
		window.open(url);
	}
}
function printGoods(auto){
	with(document.forms[0]){
		var url = "print_goods.php?order_id=<?php echo $order_id?>";
		if(auto)url += "&auto_print="+auto;
		window.open(url);
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">处理发货</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司名称：</strong></td>
    <td width="84%" align="left">
	<select name="express_name" id="express_name" onchange="chooseExpress(this.value);$('order_code').select()">
	<option value="">请选择快递公司</option>
	<?php
		$express_result = $db -> query('select id,express_name,express_person,express_phone,express_ename from express where is_valid=1'.get_check_organ_sql(172).' order by order_index asc,id asc');
		foreach($express_result as $row){
			echo "<option value=\"".$row[0]."|".$row[1]."|".$row[4]."|".$row[2]."|".$row[3]."\">".$row[1]."</option>";
		}
	?>
	</select>
	<?php
		if($check_result['assign_express_id']){
	?>
	<span style="margin-left:20px;color:#ccc">* 已自动选定客服指定的快递[<?php echo $check_result['assign_express_name']?>]</span>
	<script type="text/javascript">
		chooseItem('express_name','<?php echo $check_result['assign_express_name']?>',true);
	</script>
	<?php
		}
	?>
	</td>
  </tr>
  <tr bgcolor="#ffffff" id="order_code_tr">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>快递单号：</strong></td>
    <td width="84%" align="left"><input type="text" name="order_code" id="order_code" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递人姓名：</strong></td>
    <td width="84%" align="left"><input type="text" name="express_person" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递人电话：</strong></td>
    <td width="84%" align="left"><input type="text" name="express_phone" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>预计到货时间：</strong></td>
    <td width="84%" align="left"><input name="expect_arrive_time" type="text" value="<?php echo get_time("Y年n月j日G点i分")?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货提醒：</strong></td>
    <td width="84%" align="left"><label><input name="is_send_short_msg" id="is_send_short_msg" type="checkbox" value="1" />给客户发送已发货提醒短信</label><span style="color:#ccc;margin-left:10px">勾选此项后系统会将发货信息以短信的形式发送到客户的手机上，当系统判断发货单号的格式正确时此项会自动勾选，也可手动的勾选或取消</span></td>
  </tr>
  <script type="text/javascript">
  $('order_code').onkeyup=$('order_code').onblur=function(){
  	if(this.value.length>8)$('is_send_short_msg').checked=true;
  };
  </script>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value="打印快递单据" onclick="printOrder()" />　
		<input type="button" value="打印货品清单" onclick="printGoods()" />　
		<input type="button" value=" 确定发货 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2">
		<div style="text-align:left;padding:5px 0;line-height:24px">
		<div style="color:#f00">为了能够正确打印单据请注意以下设置：</div>
			<ul style="list-style:decimal;margin:0;">
				<li>设置浏览器打印边距全部为0</li>
				<li>设置打印机纸张为B5(没有B5选A4)</li>
				<li>挪动打印机滑块，调整最佳放纸位置</li>
			</ul>
		</div>
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

//财务处理需要退货
function cancel(){
	check_user(64);
	$order_id = $_GET["order_id"];
	if(!isset($order_id)){
		$order_id = get_selected(false,1);
	}

	$offset = $_GET["offset"];
	$src = $_GET["src"];
	$w = $_GET["w"];
	$param = "offset=".$offset.'&w='.$w.'&src='.$src;

	include 'include/guide.php';
	global $db;
	$guide = new guide();
	$db = new db(true);

	$is_error = false;

	$order_state = $db -> query("select order_state_code,return_finance_id,return_finance_name,parent from orderform where id=".$order_id,true);
	//if($order_state['parent']){
	//	$guide -> set_message("对不起，该订单是附属订单，不能单独处理退货！",true);
	//	$is_error = true;
	//}else{
		if($order_state[0]>200){
			$guide -> set_message("对不起，该退货订单已被[<a href=\"user.php?c=amply&user_id=".$order_state[1]."\">".$order_state[2]."</a>]处理完毕！",true);
			$is_error = true;
		}
	//}

	if($is_error){
		$guide -> append("货到付款的订单","?".str_replace('src','c',$param));
		$guide -> append("查看订单详细页","?c=amply&order_id=".$order_id);
		$guide -> append("款到发货的订单","?c=money");
		$guide -> out();
	}

	if($_GET["method"]=="post"){

		$user_id = $_SESSION["user_id"];
		$user_name = $_SESSION["user_name"];
		$time = get_time();
		$reason = $_POST["return_reason"];
		//$db -> execute("update orderform set return_finance_id=".$user_id.",return_finance_name='".$user_name."',return_finance_time='".$time."',return_reason='".$reason."',order_state_code=500,order_state_name='等待发货部确认收到退货'".get_relate_order_where($order_id));
		$db -> execute("update orderform set return_finance_id=".$user_id.",return_finance_name='".$user_name."',return_finance_time='".$time."',return_reason='".$reason."',order_state_code=500,order_state_name='等待发货部确认收到退货' where id=".$order_id);


		//记录更新数据的日志数组
		$data_update_logs_array = array();

		//将需要退货的数据加入到更新日志
		$data_update_logs_array['update_orderform'] = array(
			'data'	=>	array(
				'order_state_code'				=>		500,
				'order_state_name'				=>		'等待发货部确认收到退货',
				'return_finance_id'				=>		$user_id,
				'return_finance_name'			=>		$user_name,
				'return_finance_time'			=>		$time,
			),
			'where'	=>	array(
				'order_id'	=>	$order_id,
			),
		);

		//将更新数据写入到日志文件中
		append_update_logs('manage_order_return',$data_update_logs_array);



		$guide -> set_message("订单处理成功！");

		$guide -> append("货到付款的订单","?".str_replace('src','c',$param));
		$guide -> append("查看订单详细页","?c=amply&order_id=".$order_id);
		$guide -> append("款到发货的订单","?c=money");
		$guide -> out();
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
//		if(return_reason.value==""){
//			alert("请输入退货原因！");
//			return;
//		}
		$('submit_btn').disabled=true;
		action = "?c=cancel&method=post&order_id=<?php echo $order_id?>&<?php echo $param?>?>";
		method = "post";
		submit();
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">处理需要退货</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>退货原因：</strong></td>
    <td width="84%" align="left"><textarea cols="50" rows="6" name="return_reason"></textarea></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value=" 确 定 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

//修改快递
function express(){
	check_user(56);
	global $db;
	$db = new db(true);
	include 'include/guide.php';
	$guide = new guide();
	$order_id = $_GET["order_id"];
	if(!isset($order_id))$order_id = get_selected(false,1);
	$param = get_common_param();
	$order_type = $_GET["order_type"];
	if(!empty($order_type))$param .= "&order_type=".$order_type;

	$is_valid = true;

	$order = $db->query("select is_valid,parent,is_sent from orderform where id=".$order_id,true,'assoc');
	switch(true){
		case $order['is_valid']==0:
			$guide -> set_message("对不起，该订单已被删除，不能修改发货！",true);
			$is_valid = false;
			break;
		case $order['is_sent']==0:
			$guide -> set_message("对不起，该订单还未发货！",true);
			$is_valid = false;
			break;
	}

	if($is_valid){
		if($order['parent']){
			$guide -> set_message("对不起，该订单是附属订单，不能单独处理发货！",true);
			$is_valid = false;
		}
	}

	if(!$is_valid){
		$guide -> append("已发货订单列表","?c=complete&".$param);
		$guide -> append("订单详细内容","?c=amply&order_id=".$order_id);
		$guide -> append("待发货订单列表","?c=wait");
		$guide -> append("待退货订单列表","?c=back");
		$guide -> out();
	}

	if($_GET["method"]=="post"){
		$express_order_code = $_POST["order_code"];
		$express = explode("|",$_POST["express_name"]);
		$express_id = $express[0];
		$express_name = $express[1];
		$express_ename = $express[2];
		if(strpos($express_ename,'-')!==FALSE)$express_ename=current(explode('-',$express_ename));
		$express_person_name = $_POST["express_person"];
		$express_person_phone = $_POST["express_phone"];
		$expect_arrive_time = $_POST["expect_arrive_time"];
		$exists_count = 0;
		if($express_id==7)$express_order_code='';
		$relate_order_id_array = get_relate_order_id($order_id);
		if(!empty($express_order_code)){
			$is_exists = FALSE;
			$exists_order_result = $db->query("select id from orderform where is_valid=1 and express_id<>7 and express_id=".$express_id." and express_order_code='".$express_order_code."'");
			$exists_order_id_array = array_strip($exists_order_result);
			foreach($exists_order_id_array as $exists_order_id){
				if(!in_array($exists_order_id,$relate_order_id_array)){
					$is_exists = TRUE;
					break;
				}
			}
		}
		if($is_exists){
			$guide -> set_message("对不起，快递公司[".$express_name."]的单号[".$express_order_code."]已经存在，请检查单号是否正确！",true);
			$guide -> append("返回重新修改发货信息","?c=express&order_id=".$order_id);
		}else{

			$db -> execute("update orderform set express_id=".$express_id.",express_name='".$express_name."',express_ename='$express_ename',express_order_code='".$express_order_code."',express_person_name='".$express_person_name."',express_person_phone='".$express_person_phone."',expect_arrive_time='".$expect_arrive_time."'".get_relate_order_where($relate_order_id_array));
			$db -> execute("update sendrecord set express_id=$express_id,express_name='$express_name',express_ename='$express_ename',express_order_code='$express_order_code'".get_relate_order_where($relate_order_id_array,NULL,'order_id'));



			//记录处理发货的日志数组
			$data_update_logs_array = array();

			//将修改发货信息的数据加入到更新日志
			$data_update_logs_array['update_orderform'] = array(
				'data'	=>	array(
					'express_id'				=>		$express_id,
					'express_name'				=>		$express_name,
					'express_ename'				=>		$express_ename,
					'express_order_code'		=>		$express_order_code,
				),
				'where'	=>	array(
					'order_id'	=>	$order_id,
				),
			);

			//将更新数据写入到日志文件中
			append_update_logs('amend_order_send',$data_update_logs_array);


			$guide -> set_message("快递信息已修改成功！");


			//给客户发送发货提醒短信
			$short_msg_status=0;
			if($_POST['is_send_short_msg']){
				$short_msg_data = $db->query('select guest_id,guest_name,express_name,express_order_code as express_code from orderform where id='.$order_id,true);
				$result = send_short_msg_to_guest('send',$short_msg_data);
				if(!$result['status']){
					$intro .= '<div style="color:#093">客户发货提醒短信发送成功！</div>';
					$short_msg_status=1;
				}else{
					$intro .= '<div style="color:#fa3">客户发货提醒短信发送失败！失败原因：'.$result['msg'].($result['status']==1?'，手机号码：'.$result['mobilephone']:'').'</div><div style="color:#ccc">注意：短信的发送成功与否，并不会影响订单的正常发货处理</div>';
					$short_msg_status=2;
				}
			}
			$guide -> set_intro($intro);

			//更新发送短信状态
			if($short_msg_status)$db->execute('update orderform set is_send_express_short_msg='.$short_msg_status.get_relate_order_where($relate_order_id_array));


		}
		$guide -> append("已发货订单列表","?c=complete&".$param);
		$guide -> append("订单详细内容","?c=amply&order_id=".$order_id);
		$guide -> append("待发货订单列表","?c=wait");
		$guide -> append("待退货订单列表","?c=back");
		$guide -> out();
	}
	$order_result = $db -> query("select express_id,express_name,express_order_code,express_person_name,express_person_phone,expect_arrive_time from orderform where id=".$order_id,true);
?>
<script src="js/element.js" type="text/javascript"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function checkForm(){
	with(document.forms[0]){
		if(express_name.value==""){
			alert("请选择快递公司！");
			return;
		}
		if(express_name.value.split("|")[0]!=7){
			if(order_code.value==""){
				alert("请输入快递单号！");
				return;
			}
		}
		if(isExistSpace(order_code.value)){
			alert("快递单号中不允许出现空白字符！");
			return;
		}
		$('submit_btn').disabled=true;
		action = "?c=express&method=post&order_id=<?php echo $order_id?>&<?php echo $param?>";
		method = "post";
		submit();
	}
}
function chooseExpress(express){
	if(express=="")express="|||";
	var expressArray = express.split("|");
	with(document.forms[0]){
		$("order_code_tr").style.display=expressArray[0]==7?"none":"";
		express_person.value = expressArray[3];
		express_phone.value = expressArray[4];
	}
}
function printOrder(auto){
	with(document.forms[0]){
		if(express_name.value==""){
			alert("请选择快递公司！");
			return;

		}
		var url = "print.php?order_id=<?php echo $order_id?>&express_id="+express_name.value.split("|")[0];
		if(auto)url += "&auto_print="+auto;
		window.open(url);
	}
}
function printGoods(auto){
	with(document.forms[0]){
		var url = "print_goods.php?order_id=<?php echo $order_id?>";
		if(auto)url += "&auto_print="+auto;
		window.open(url);
	}
}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">修改快递信息</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司名称：</strong></td>
    <td width="84%" align="left">
	<select name="express_name" id="express_name" onchange="chooseExpress(this.value);$('order_code').select()">
	<option value="">请选择快递公司</option>
	<?php
		//$express_result = $db -> query("select id,express_name,express_person,express_phone from express where is_valid=1".get_check_organ_sql(172).' order by order_index asc,id asc');
		//暂时不判断机构了
		$express_result = $db -> query('select id,express_name,express_person,express_phone,express_ename from express where is_valid=1'.get_check_organ_sql(172).' order by order_index asc,id asc');
		foreach($express_result as $row){
			echo "<option value=\"".$row[0]."|".$row[1]."|".$row[4]."|".$row[2]."|".$row[3]."\">".$row[1]."</option>";
		}
	?>
	</select>
	  <script type="text/javascript">chooseItem("express_name","<?php echo $order_result[1]?>",true)</script>
	</td>
  </tr>
  <tr bgcolor="#ffffff" <?php if($order_result[0]==7)echo "style=\"display:none\""?> id="order_code_tr">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>快递单号：</strong></td>
    <td width="84%" align="left"><input type="text" name="order_code" id="order_code" value="<?php echo $order_result[2]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递人姓名：</strong></td>
    <td width="84%" align="left"><input type="text" name="express_person" value="<?php echo $order_result[3]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递人电话：</strong></td>
    <td width="84%" align="left"><input type="text" name="express_phone" value="<?php echo $order_result[4]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>预计到货时间：</strong></td>
    <td width="84%" align="left"><input name="expect_arrive_time" type="text" value="<?php echo $order_result[5]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货提醒：</strong></td>
    <td width="84%" align="left"><label><input name="is_send_short_msg" id="is_send_short_msg" type="checkbox" value="1" />给客户发送已发货提醒短信</label><span style="color:#ccc;margin-left:10px">勾选此项后系统会将发货信息以短信的形式发送到客户的手机上，当系统判断发货单号的格式正确时此项会自动勾选，也可手动的勾选或取消</span></td>
  </tr>
  <script type="text/javascript">
  $('order_code').onkeyup=$('order_code').onblur=function(){
  	if(this.value.length>8)$('is_send_short_msg').checked=true;
  };
  </script>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value="打印快递单据" onclick="printOrder()" />　
		<input type="button" value="打印货品清单" onclick="printGoods()" />　
		<input type="button" value=" 确定发货 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}


//不需要财务处理，发货部直接退货
function dispose_return(){
	check_user(54);
	global $db;
	$db = new db(true);
	$order_id = $_GET['order_id'];
	include_once('include/guide.php');
	$guide = new guide();
	$source = $_GET['src'];
	$guide -> append('返回已发货订单列表','?c='.$source.'&'.get_common_param());
	$guide -> append('已发货订单筛选器','?c=search_send_term');
	if(!is_numeric($order_id)){
		$guide -> set_message('参数错误！',true);
	}elseif(!$db->query('select count(*) from orderform where id='.$order_id.' and is_valid=1 and order_type_code=0 and order_state_code=200',true,true)){
		$guide -> set_message('只有等待财务确认到款的货到付款的订单才可以直接退货！',true);
	}else{
		$time = get_time();
		//回滚库存
		//$relate_order_id_array = get_relate_order_id($order_id);
		//if(rollback($relate_order_id_array)===TRUE){
		if(rollback($order_id)===TRUE){
			//$db -> execute("update orderform set return_reason='发货部已经提前收到退货,由发货部直接处理退货！',order_state_code=600,order_state_name='已经退货',return_sender_id=".$_SESSION['user_id'].",return_sender_name='".$_SESSION['user_name']."',return_sender_time='".get_time()."'".get_relate_order_where($relate_order_id_array));
			$db -> execute("update orderform set return_reason='发货部已经提前收到退货,由发货部直接处理退货！',order_state_code=600,order_state_name='已经退货',return_sender_id=".$_SESSION['user_id'].",return_sender_name='".$_SESSION['user_name']."',return_sender_time='".$time."' where id=".$order_id);


			//记录更新数据的日志数组
			$data_update_logs_array = array();

			//将处理退货的数据加入到更新日志
			$data_update_logs_array['update_orderform'] = array(
				'data'	=>	array(
					'order_state_code'				=>		600,
					'order_state_name'				=>		'已经退货',
					'return_sender_id'				=>		$_SESSION['user_id'],
					'return_sender_name'			=>		$_SESSION['user_name'],
					'return_sender_time'			=>		$time,
				),
				'where'	=>	array(
					'order_id'	=>	$order_id,
				),
			);


			//将更新数据写入到日志文件中
			append_update_logs('confirm_order_return',$data_update_logs_array);




			$guide -> set_message('处理退货成功！');
			$guide -> append('该订单详细页','?c=amply&id='.$order_id);
		}else{
			$guide -> set_message('库存参数错误！',true);
		}
	}
	$guide -> out();
}

//财务先处理需要退货之后，发货部在收到退货后处理这个
function receipt(){
	check_user(54);
	global $db;
	$order_id = $_GET["order_id"];
	$db = new db(true);
	$sender_id = $_SESSION["user_id"];
	$sender_name = $_SESSION["user_name"];
	$sender_time = get_time();
	include_once("include/guide.php");
	$guide = new guide();
	$guide -> append("待退货订单","?c=back&".get_common_param());
	$guide -> append("订单详细页","?c=amply&order_id=".$order_id);
	$guide -> append("待发货订单","?c=wait");
	if(!$db->query('select count(*) from orderform where id='.$order_id.' and is_valid=1 and order_type_code=0 and order_state_code=600',true,true)){
		//$relate_order_id_array = get_relate_order_id($order_id);
		//if(rollback($relate_order_id_array)===TRUE){
		if(rollback($order_id)===TRUE){
			$db -> execute("update orderform set return_sender_id=".$sender_id.",return_sender_name='".$sender_name."',return_sender_time='".$sender_time."',order_state_code=600,order_state_name='已经退货' where id=".$order_id);


			//记录更新数据的日志数组
			$data_update_logs_array = array();

			//将处理退货的数据加入到更新日志
			$data_update_logs_array['update_orderform'] = array(
				'data'	=>	array(
					'order_state_code'				=>		600,
					'order_state_name'				=>		'已经退货',
					'return_sender_id'				=>		$_SESSION['user_id'],
					'return_sender_name'			=>		$_SESSION['user_name'],
					'return_sender_time'			=>		$time,
				),
				'where'	=>	array(
					'order_id'	=>	$order_id,
				),
			);

			//将更新数据写入到日志文件中
			append_update_logs('confirm_order_return',$data_update_logs_array);


			$guide -> set_message("订单处理退货成功！");
		}else{
			$guide -> set_message('库存参数错误！',true);
		}
	}else{
		$guide -> set_message('该订单已经退货完毕，不允许重复处理退货！',true);
	}
	$guide -> out();
}

//调整退货返还库存
function set_return_stock(){
	check_user(54);
	global $db;
	$db = new db(true);
	include 'include/guide.php';
	$guide = new guide();
	$order_id = $_GET["order_id"];
	if(!is_numeric($order_id)){
		$order_id=get_selected(false,1);
	}

	$is_valid = true;

	$order = $db->query('select order_type_code,parent from orderform where id='.$order_id,true,'assoc');

	//if($order['parent']){
	//	$guide -> set_message("对不起，该订单是附属订单，不能单独处理退货！",true);
	//	$is_valid = false;
	//}

	if($order['order_type_code']){
		$guide -> set_message("对不起，该订单类型是款到发货，不符合处理退货的条件！",true);
		$is_valid = false;
	}


	$action = '?c=';
	if(empty($_GET['src'])){
		$action .= 'receipt';
		$guide -> append("待退货订单列表","?c=back&".get_common_param());
		$guide -> append("订单详细内容","?c=amply&order_id=".$order_id);
		$guide -> append("已发货订单列表","?c=complete");
		$guide -> append("待发货订单列表","?c=wait");
	}else{
		$guide -> append("返回已发货订单列表","?c=complete&".get_common_param());
		$guide -> append("订单详细内容","?c=amply&order_id=".$order_id);
		$guide -> append("待退货订单列表","?c=back");
		$guide -> append("待发货订单列表","?c=wait");
		$action .= 'dispose_return&src='.$_GET['src'];
	}
	$action .= '&order_id='.$order_id.'&'.get_common_param();

	if(!$is_valid)$guide -> out();

	$product_result = $db -> query("select product_id,product_count from gift where order_id=".$order_id." and product_id>0");
?>
	<script type="text/javascript" src="js/element.js"></script>
	<script type="text/javascript">
		function countStock(t,id){
			if(t){
				if(!/^\d+$/.test($('bad_'+id).value))$('bad_'+id).value=0;
				if(parseInt($('bad_'+id).value)>parseInt($('total_'+id).value))$('bad_'+id).value=$('total_'+id).value;
				$('stock_'+id).value = parseInt($('total_'+id).value)-parseInt($('bad_'+id).value);
			}else{
				if(!/^\d+$/.test($('stock_'+id).value))$('stock_'+id).value=0;
				if(parseInt($('stock_'+id).value)>parseInt($('total_'+id).value))$('stock_'+id).value=$('total_'+id).value;
				$('bad_'+id).value = parseInt($('total_'+id).value)-parseInt($('stock_'+id).value);
			}
		}
		function checkForm(){
			$('submit_btn').disabled=true;
			with(document.forms[0]){
				action = '<?php echo $action?>';
				method = 'post';
				submit();
			}
		}
	</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">设置退货返还和报废库存</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品列表：</strong></td>
    <td width="84%" align="left">
	  <table border="0" cellpadding="0" cellspacing="1" bgcolor="#CCCCCC" style="margin:10px 0">
        <tr bgcolor="#eeeeee">
          <td height="30" align="center">产品名称</td>
          <td align="center">产品总盒数</td>
          <td align="center">返还库存数</td>
          <td align="center">报废盒数</td>
        </tr>
		<?php
			$gift_result = $db -> query("select product_id,product_name,sum(product_count),sum(gift_money),gift_type from gift where order_id=".$order_id." group by product_id");
			if(count($gift_result)>0){
				foreach($gift_result as $item){
		?>
        <tr bgcolor="#FFFFFF">
          <td height="30" align="center"><a <?php echo "href=\"product.php?c=amply&product_id=".$item[0]."\"";echo "style=\"color:#".($item[4]?"000":"666")."\""?>><?php echo $item[1]?></a></td>
          <td align="center"><?php echo $item[2]?></td>
          <td align="center"><input type="hidden" id="total_<?php echo $item[0]?>" name="total_<?php echo $item[0]?>" value="<?php echo $item[2]?>" /><input type="text" size="6" name="stock_<?php echo $item[0]?>" id="stock_<?php echo $item[0]?>" value="<?php echo $item[2]?>" onkeyup="countStock(0,<?php echo $item[0]?>)" onfocus="this.select()" style="text-align:center" /></td>
          <td align="center"><input type="text" size="6" name="bad_<?php echo $item[0]?>" id="bad_<?php echo $item[0]?>" value="0" onkeyup="countStock(1,<?php echo $item[0]?>)" onfocus="this.select()" style="text-align:center" /></td>
        </tr>
		<?php
				}
			}
		?>
      </table>
		<div style="margin-bottom:10px">[返还的或者报废的只需输入其中一个即可，系统会根据所输入的数字自动计算]</div>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center">
		<input type="button" value=" 确 定 " onclick="if(confirm('系统将按照您设置的数据进行返还库存，确定要继续吗？'))checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}







function ample(){
	check_user(45);
	$order_id = $_GET["order_id"];

	if(!is_numeric($order_id))exit('参数错误');

	$db = new db(true);
	$order_result = $db->query("select 
	orderform.order_code,
	orderform.order_name,
	orderform.product_id,
	orderform.product_name,
	orderform.product_package_count,
	orderform.product_package_price,
	orderform.order_money,
	orderform.guest_id,
	orderform.guest_name,
	orderform.guest_region_code,
	orderform.guest_region_name,
	orderform.guest_address,
	orderform.guest_postcode,
	orderform.guest_contact,
	orderform.order_type_code,
	orderform.order_type_name,
	orderform.money_expect_time,
	orderform.money_bank_name,
	orderform.money_bank_code,
	orderform.order_state_code,
	orderform.order_state_name,
	orderform.addition_id,
	orderform.addition_name,
	orderform.add_time,
	orderform.money_fact_time,
	orderform.money_fact_count,
	orderform.money_manager_id,
	orderform.money_manager_name,
	orderform.sender_id,
	orderform.sender_name,
	orderform.send_time,
	orderform.express_id,
	orderform.express_name,
	orderform.express_order_code,
	orderform.express_person_name,
	orderform.express_person_phone,
	orderform.expect_arrive_time,
	orderform.return_finance_id,
	orderform.return_finance_name,
	orderform.return_finance_time,
	orderform.return_reason,
	orderform.return_sender_id,
	orderform.return_sender_name,
	orderform.return_sender_time,
	orderform.is_finished,
	orderform.is_valid,
	orderform.order_intro,
	orderform.id,
	orderform.product_unit_count,
	orderform.delete_person_id,
	orderform.delete_person_name,
	orderform.delete_time,
	organ.name,
	orderform.is_sent,
	orderform.order_channel_name,
	orderform.order_logs,
	orderform.parent,
	orderform.child_count,
	assign_express_name,
	express_ename,
	express_status,
	phase_index,
	orderform.bank_money_time,
	orderform.bank_money_account_name,
	orderform.get_money_deal_code,
	orderform.resources_add_day,
	orderform.reserve_money,
	orderform.pay_money,
	orderform.active_tag_id,
	orderform.guest_age,
	orderform.is_allow_send,
	orderform.reserve_money_manager_id,
    orderform.reserve_money_manager_name,
	orderform.reserve_money_fact_count,
	orderform.reserve_money_fact_time 
	 from orderform inner join organ on organ.id=orderform.organ_id where orderform.id=".$order_id,true);

	 if(!count($order_result))exit('参数错误');

	 append_log(11,'查看订单详细页',$order_id);

?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/description.js?v=1.0"></script>
<script type="text/javascript">

function remove(url){
    <?php
    //如果有删除权限
    if(check_function(47)){
    ?>
    var isSent = <?php echo ($order_result[19]==400||$order_result[53])?'true':'false'?>;
    if(isSent){
    <?php
        //如果有删除已发货订单的权限
        if(check_function(182)){
    ?>
        var message = '严重 警告！！！！！请认真阅读下面的说明并按提示谨慎操作！\n\n\n删除订单将自动返还库存，您删除的订单是【发货中】或【已发货】的状态，这需要您核实一下订单的货物是不是可追回的！\n\n1.如果是可追回的(快递还没取走)，那么确定如果您确定要删除该订单的话，请点确定按钮删除订单，然后把货品放回仓库！\n2.如果是不可追回的(快递已经取走)，那么请不要点确定按钮，请不要删除订单，以免造成库存混乱，这种情况的订单，请走退货流程，等待收到退货！';
        if(window.confirm(message)){
            location = url;
        }
    <?php
        //否则没有删除已发货的权限
        }else{
    ?>
        alert('<?php echo get_alert_message(182)?>');
    <?php
        }
    ?>
    }else{
        if(window.confirm('确定要删除这个订单吗？')){
            location = url;
        }
    }
    <?php
    }else{
    ?>
    alert('<?php echo get_alert_message(47)?>');
    <?php
    }
    ?>
}

<?php
	$interval_second = 200;
?>

var intervalSecond = <?php echo $interval_second?>;
var interval;

function startWait(s){
	if(!s)s=intervalSecond;
	$('update_btn').value = '冷却中...('+s+')';
	interval = setInterval(function(){
		$('update_btn').value = '冷却中...('+(--s)+')';
		if(s==0){
			clearInterval(interval);
			$('update_btn').value = '更新数据';
			$('update_btn').disabled=false;
		}
	},1000);
}

function insertLogs(string,isAuto){
	try{
		eval('var d='+string);
		if(typeof(d)=='object'){
			if(!d.status){
				if(!d.is_finished || d.is_finished=='0'){
					if(!isAuto)startWait();
				}else{
					$('update_btn').style.display='none';
				}
				if(typeof(d.data)=='object' && d.data.length){
					var html = '<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#eeeeee">';
					for(var i=0;i<d.data.length;i++){
						html += '\
							<tr bgcolor="#ffffff">\
								<td height="30" align="center">'+d.data[i]['time']+'</td>\
								<td align="left">'+d.data[i]['context']+'</td>\
							</tr>\
						';
					}
					html += '</table>';
					$('logs').innerHTML = html;
				}
			}else{
				//alert(d.errmsg);
				startWait();
			}
		}
	}catch(e){
		alert(string);
	}
}

function showLoad(){
	$('load_bg').style.display = 'block';
	$('load_bg').style.width = $('logs_block').offsetWidth+'px';
	$('load_bg').style.height = $('logs_block').offsetHeight+'px';
	$('load').style.display = 'block';
	$('load').style.marginLeft = (($('logs_block').offsetWidth-$('load').offsetWidth)>>1)+'px';
	$('load').style.marginTop = (($('logs_block').offsetHeight-$('load').offsetHeight)>>1)+'px';
}

function hideLoad(){
	$('load_bg').style.display = 'none';
	$('load').style.display = 'none';
}

var defaultMessage = '请在这里填写备注信息...';

function showIntroWindow(){
	var width = document.documentElement.scrollWidth<document.documentElement.clientWidth?document.documentElement.clientWidth:document.documentElement.scrollWidth;
	var height = document.documentElement.scrollHeight<document.documentElement.clientHeight?document.documentElement.clientHeight:document.documentElement.scrollHeight;
	var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	$('bg').style.display = '';
	$('bg').style.width = width+'px';
	$('bg').style.height = height+'px';
	$('win').style.display = '';
	$('win').style.left = scrollLeft + ((document.documentElement.clientWidth-$('win').clientWidth-100)>>1) + 'px';
	$('win').style.top = scrollTop + ((document.documentElement.clientHeight-$('win').clientHeight-100)>>1) + 'px';
	$$$('textarea','win')[0].value = defaultMessage;
}

function hideIntroWindow(){
	$('bg').style.display = 'none';
	$('win').style.display = 'none';
}

<?php
	$express_ename = $order_result['express_ename'];
	if(!empty($express_ename)){
?>

function getExpressLogs(){
	showLoad();
	$('update_btn').disabled=true;
	execute('post','get.php?c=get_express_logs',function(string){
		hideLoad();
		insertLogs(string);
	},'express_ename=<?php echo $express_ename?>&express_code=<?php echo $order_result[33]?>&source='+$('source').value+'&is_nocache=1');
}
<?php
		$express_log = $db->query('select express_status,express_data,last_update_status,last_update_time,is_finished,source,add_time from express_logs where express_ename=\''.$express_ename.'\' and express_code=\''.$order_result[33].'\'',true,'assoc');
		echo '
			window.onload = function(){
				$(\'logs_block\').style.display = \'block\';
		';
		$express_data = $express_log['express_data'];
		if(!empty($express_data) && $express_data!='[]'){
			$log_list = (array)json_decode($express_data);
			$express_data = array(
				'data'	=>	$log_list,
				'is_finished'	=>	$express_log['is_finished'],
			);
			echo 'insertLogs(\''.json_encode($express_data).'\',true);';
			$is_none_data = false;
		}else{
			$is_none_data = true;
		}
		//如果未完结
		if(!$express_log['is_finished']){
			//计算更新间隔时间
			$diff_second = time()-strtotime($express_log['last_update_time']);
			if($diff_second<$interval_second){
				echo 'startWait('.($interval_second-$diff_second).');';
			}else{
				if($is_none_data){

					if( strtotime(date('Y-m-d',strtotime($order_result['send_time']))) < strtotime(date('Y-m-d',time())) ){

						$auto_update = TRUE;

						if(intval($order['last_update_status']) && $order['add_time']){
							//如果最后一次更新距离第一次更新，超过2天就跳过
							if(strtotime($order['last_update_time'])-strtotime($order['add_time'])>60*60*48){
								$auto_update = FALSE;
							}
						}

						if($auto_update){
							echo 'getExpressLogs();';
						}else{
							echo '$(\'update_btn\').disabled=false;';
						}

					}
				}else{
					echo '$(\'update_btn\').disabled=false;';
				}
			}
		}else{
			echo '$(\'update_btn\').style.display=\'none\';';
		}
?>
		var bg = document.createElement('div');
		var win = document.createElement('div');
		bg.id = 'bg';
		win.id = 'win';
		bg.style.cssText = 'position:absolute;left:0;top:0;opacity:0;filter:alpha(opacity:0);background:#fff;display:none';
		win.style.cssText = 'position:absolute;left:0;top:0;z-index:1;border:5px solid #ececec;padding:20px;background:#fff;display:none';
		win.innerHTML = '\
			<div style="font-size:14px;font-weight:bold;color:#999">请填写回访内容：\</div>\
			<div style="margin-top:15px"><textarea style="width:500px;height:80px;font-size:14px;padding:5px;overflow:auto;border:1px solid #ccc;color:#999">'+defaultMessage+'</textarea></div>\
			<div style="margin-top:15px" id="btn_list"><input type="button" value="确 定" style="height:30px;width:80px" /> <input type="button" value="取 消" style="height:30px;width:80px;margin-left:20px" /></div>\
		';
		document.body.appendChild(bg);
		document.body.appendChild(win);

		var btnList = $$$('input','btn_list');
		var textarea = $$$('textarea','win')[0];
		btnList[0].onclick = function(){
			var btn = this;
			var intro = textarea.value;
			if(intro.length && intro!=defaultMessage){
				//btn.disabled = true;
				execute('post','get.php?c=append_service_logs',function(result){
					try{
						eval('d='+result);
					}catch(e){
						alert(result);
						btn.disabled = false;
						return;
					}
					if(!d.status){
						var serviceLogsList = $('service_logs_list');
						var html = '<table width="50%" border="0" cellpadding="0" cellspacing="1"><tr><td style="padding:10px 0 0 5px" align="left"><a href="user.php?c=amply&user_id=<?php echo $_SESSION['user_id']?>"><?php echo $_SESSION['user_name']?></a> ';
						html += '在<span style="color:#f74;margin:0 2px">'+d['phase_index']+'</span>阶段手动添加回访记录';
						html += '<span style="display:block;color:#ccc;margin-top:5px;line-height:18px">'+d['intro']+'</span></td><td style="padding:10px 5px 0 5px" align="right" valign="top">'+d['add_time']+'</td></tr></table>';
						var childList = $$$('div',serviceLogsList);
						var newItem = document.createElement('div');
						newItem.innerHTML = html;
						if(!childList.length){
							serviceLogsList.appendChild(newItem);
						}else{
							serviceLogsList.insertBefore(newItem,childList[0]);
						}
						hideIntroWindow();
					}else{
						alert(d['msg']);
					}
					btn.disabled = false;
				},'order_id=<?php echo $order_id?>&intro='+intro);
			}else{
				alert('内容不能为空！');
			}
		};
		btnList[1].onclick=hideIntroWindow;
		textarea.onfocus=function(){
			if(this.value==defaultMessage)this.value='';
		};
		textarea.onblur=function(){
			if(this.value=='')this.value=defaultMessage;
		};
		$('append_service_logs_btn').onclick=showIntroWindow;

<?php
		echo '};';
	}

	include 'include/express.config.php';

	$express_config = $express_list[$express_ename];

?>
	var source_list = <?php echo json_encode($source_list)?>;

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">查看订单详细页</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
	<div style="position:absolute;right:12px;width:40%;background:#fff;display:none" id="logs_block">
	<div style="background:#fc6;filter:alpha(opacity=50);opacity:0.5;position:absolute;display:none" id="load_bg"></div>
	<div style="background:#fff;position:absolute;border:3px solid #f0f0f0;padding:20px 40px;display:none" id="load"><img src="images/loading.gif" style="vertical-align:middle" />正在努力加载数据...</div>
	<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
		<tr>
			<td height="30" align="center" colspan="2" bgcolor="#f3f3f3"><strong>快递单跟踪</strong></td>
		</tr>

		<tr bgcolor="#ffffff">
			<td height="30" align="center" bgcolor="#fcfcfc"><strong>快递信息：</strong></td>
			<td align="left"><?php
				$row = $order_result;
				if(strpos($row['express_name'],'-')!==FALSE)$row['express_name']=current(explode('-',$row['express_name']));
				echo $row['express_name'].'：'.$row['express_order_code'];
				$express_status = $row['express_status'];
				if(is_numeric($express_status)){
					echo '<span style="color:#'.$express_status_pointer[$express_status]['color'].';margin-left:5px">['.$express_status_pointer[$express_status]['name'].']</span>';
				}
				$last_update_time = $db->query('select last_update_time from express_logs where express_ename=\''.$row['express_ename'].'\' and express_code=\''.$row['express_order_code'].'\'',true,true);
				if($last_update_time){
					echo '<span style="color:#ccc;margin-left:5px" description="最后更新时间：'.$last_update_time.'">(更新自'.date_diff(strtotime($last_update_time)).')</span>';
				}
			?>
			</td>
		</tr>
		<tr bgcolor="#ffffff">
			<td colspan="2" style="padding:5px" id="logs">
				<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#eeeeee">
					<tr bgcolor="#ffffff">
						<td height="30" colspan="2" align="center" id="none_logs" style="color:#FF6633">没有找到快递信息！</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr bgcolor="#ffffff">
			<td height="30" align="center" bgcolor="#fcfcfc" colspan="2">
				数据源：<span id="source_block"><select id="source" style="margin-right:5px">
				<?php
					foreach($source_list as $key => $source){
				?>
				<option value="<?php echo $key?>" description="<?php echo $source['link']?>"><?php
					echo $source['name'];
					if($express_config['source']==$key)echo '[默认]';
				?></option>
				<?php
					}
				?>
				</select></span>
				<input type="button" value="更新数据" style="border:1px solid #ccc;border-color:#fff #ccc #ccc #fff;background:#fff;cursor:pointer" onclick="getExpressLogs();this.blur();" id="update_btn" disabled="disabled" />
				<input type="button" value="访问源网站" style="border:1px solid #ccc;border-color:#fff #ccc #ccc #fff;background:#fff;cursor:pointer;margin-left:7px" onclick="alert('出于安全考虑请手动复制此网址访问：'+source_list[$('source').value]['link'])" />
				<input type="button" value="隐藏" style="border:1px solid #ccc;border-color:#fff #ccc #ccc #fff;background:#fff;cursor:pointer;margin-left:7px" onclick="$('logs_block').style.display='none'" />
				<?php
					$selected_source = $express_log['source']?$express_log['source']:$express_config['source'];
				?>
				<script type="text/javascript">
					$('source').value='<?php echo $selected_source?>';
				</script>
			</td>
		</tr>
	</table>
</div>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单编号：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[0]?></td>
  </tr>
  <tr bgcolor="#ffffff" style="display:none">
    <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单名称：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[1]?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品疗程数量：</strong></td>
    <td width="84%" align="left">
	<?php
		if(!check_group("5"))echo "共".$order_result[4]."个疗程";
	?>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单产品：</strong></td>
    <td width="84%" align="left">
	  <table width="355" border="0" cellpadding="0" cellspacing="1" bgcolor="#CCCCCC" style="margin:10px 0">
        <tr bgcolor="#eeeeee">
          <td width="114" height="30" align="center">产品名称</td>
          <td width="120" align="center">产品盒数</td>
          <td width="117" align="center">产品价值</td>
        </tr>
		<?php
			$gift_result = $db -> query("select product_id,product_name,product_count,gift_money,gift_type from gift where order_id=".$order_id);
			if(count($gift_result)>0){
				foreach($gift_result as $item){
		?>
        <tr bgcolor="#FFFFFF">
          <td height="30" align="center"><a <?php echo "href=\"product.php?c=amply&product_id=".$item[0]."\"";echo "style=\"color:#".($item[4]?"000":"999")."\""?>><?php echo $item[1]?></a></td>
          <td align="center"><?php echo $item[2]?>盒</td>
          <td align="center"><?php echo $item[3]?></td>
        </tr>
		<?php
				}
			}else{
				echo "<tr bgcolor=\"#ffffff\"><td colspan=\"3\" align=\"center\" height=\"30\">没有产品！</td></tr>";
			}
		?>
      </table>
	</td>
  </tr>
  <?php
  	if(!$order_result['parent'] && $order_result['child_count']){
		$order_money_count = $order_result[6];
		$real_money_count = $order_result['order_type_code']?0:($order_result[67] ? $order_result[67] :$order_result[6]);
		$child_order_result = $db->query('select id,order_code,product_package_count,order_money,order_type_code,pay_money from orderform where is_valid=1 and parent='.$order_result['id'],'assoc');
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>附属订单信息：</strong></td>
    <td width="84%" align="left">
	<?php
		foreach($child_order_result as $child_order){
			if(!$child_order['order_type_code'])$real_money_count += ($child_order['pay_money'] ? $child_order['pay_money'] : $child_order['order_money']);
			$order_money_count += $child_order['order_money'];

	?>
	<div style="margin:10px 0;padding:1px">
		<div style="line-height:30px;background:#f6f6f6;padding-left:10px"><span style="font-weight:bold">订单编号：<a href="?c=ample&order_id=<?php echo $child_order['id']?>" target="_blank"><?php echo $child_order['order_code']?></a></span><span style="margin-left:30px">疗程数：<?php echo $child_order['product_package_count']?></span> <span style="margin-left:30px">金额：<?php echo round($child_order['order_money'],1)?></span></div>

		<table width="355" border="0" cellpadding="0" cellspacing="1" style="margin-top:10px;border:1px solid #f0f0f0">
		<tr bgcolor="#f6f6f6">
		  <td width="114" height="30" align="center">产品名称</td>
		  <td width="120" align="center">产品盒数</td>
		  <td width="117" align="center">产品价值</td>
		</tr>
		<?php
			$gift_result = $db -> query("select product_id,product_name,product_count,gift_money,gift_type from gift where order_id=".$child_order['id']);
			if(count($gift_result)>0){
				foreach($gift_result as $item){
		?>
		<tr bgcolor="#FFFFFF">
		  <td height="30" align="center"><a <?php echo "href=\"product.php?c=amply&product_id=".$item[0]."\"";echo "style=\"color:#".($item[4]?"000":"666")."\""?>><?php echo $item[1]?></a></td>
		  <td align="center"><?php echo $item[2]?>盒</td>
		  <td align="center"><?php echo $item[3]?></td>
		</tr>
		<?php
				}
			}else{
				echo "<tr bgcolor=\"#ffffff\"><td colspan=\"3\" align=\"center\" height=\"30\">没有产品！</td></tr>";
			}
		?>
		</table>
	</div>
	<?php
		}
		//发货部的给出提示
		if(in_array($_SESSION['group_id'],array(0,5))){
	?>
		<div style="margin-bottom:10px;color:#f00">请注意：附属订单的货物需要和主订单的货物一起打包发货，在打印单据的时候，附属订单的金额会自动累加到主订单的金额里</div>
	<?php
		}
	?>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单金额：</strong></td>
    <td width="84%" align="left" style="padding:10px">
        <?php   if($_SESSION['organ_name']!='极米' ||  check_function(225) || $order_result['addition_id']==$_SESSION['user_id']){ ?>
		<div>总金额：<span><?php echo round($order_money_count,1)?></span></div>
		<div style="margin-top:10px">代收款：<span style="color:#f00"><?php echo round($real_money_count,1)?></span></div>
		<?php  }else{
            if($order_result['order_type_code']==0){
        ?>
        <div>总金额：<span>***</span></div>
		<div style="margin-top:10px">代收款：<span style="color:#f00"><?php echo round($real_money_count,1)?></span></div>
        <?php
            }else{
                echo '***';
            }
		?>
		<?php } ?>
	</td>
  </tr>
  <?php
	}else{
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单金额：</strong></td>
    <?php   if($_SESSION['organ_name']!='极米' ||  check_function(225) || $row['addition_id']==$_SESSION['user_id']){ ?>
    <td width="84%" align="left"><?php echo round($order_result[6],1)?> <?php
        if(!$order_result['order_type_code']){
    ?>  <span style="color:#CCCCCC">(<?php echo '<span style="color:#0099FF">订金'.(round($order_result['reserve_money'],1)).'元 </span> +<span style="color:red">代收款'.(round($order_result['pay_money'],1)).'元</span>' ?>)</span>
    <?php } ?></td>
    <?php }else{ ?>
    <td width="84%" align="left">
        <?php if($order_result['order_type_code'] == 0){
            echo  '***<br/><span style="color:#ccc">(<span style="color:#0099FF">***</span>+<span style="color:red">'.(round($order_result[67],1) ? round($order_result[67],1) : round($order_result[6],1)).'</span>)</span>';
            }else{
            echo '***';
            }
        ?>

    </td>
    <?php } ?>
  </tr>
<?php
	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[8]?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户年龄：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[69].'岁'?></td>
 </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户资源添加时间：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[65] ? date('Y-m-d',$order_result[65]) : '' ?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户地区：</strong></td>
    <td width="84%" align="left"><?php echo round_region($order_result[10])?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货地址：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[11]?></td>
  </tr>
  <tr bgcolor="#ffffff" style="display:none">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收货邮编：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[12]?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>联系方式：</strong></td>
    <?php   if(check_function(216) || $_SESSION['organ_name']=='售后客服部' || $row['addition_id']==$_SESSION['user_id']  ||  $_SESSION['group_id']!=1){ ?>
    <td width="84%" align="left" style="padding:5px 10px;line-height:20px"><?php echo $order_result[13]?></td>
    <?php }else{  ?>
    <td width="84%" align="left" style="padding:5px 10px;line-height:20px"><?php echo str_repeat('*',mb_strlen($order_result[13],'utf-8'))?></td>
	<?php
		}
	?>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>支付方式：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<span style="font-size:16px;font-weight:bold;color:#<?php echo $order_result[14]?'093':'f30'?>"><?php echo $order_result[15]?></span>
	</td>
  </tr>
   <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>到款交易号：</strong></td>
    <td width="84%" align="left" style="padding:5px 10px;line-height:20px"><?php echo $order_result[64]?></td>
  </tr>
  <?php
  	if($order_result[14]){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>支付信息：</strong></td>
    <td width="84%" align="left" style="padding:6px 10px;line-height:20px">
	<?php
		if($order_result[17]!=""){
			echo "支付银行名称：".$order_result[17]."<br />";
		}
		if($order_result[18]!=""){
			echo "支付银行帐号：".$order_result[18]."<br />";
		}
		if($order_result[16]!=""){
			echo "预计到款时间：".$order_result[16]."<br />";
		}
		if($order_result[64]!=""){
			echo "到款交易号：".$order_result[64]."<br />";
		}
		if($order_result[62]!=""){
			echo "客户打款时间：".get_time('Y年m月d日 H点i分',strtotime($order_result[62]))."<br />";
		}
		if($order_result[63]!=""){
			echo "打款人户名：".$order_result[63];
		}
	?>
	</td>
  </tr>
  <?php
  	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单流程状态：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[20]?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>创建订单：</strong></td>
    <td width="84%" align="left"><a href="user.php?c=amply&user_id=<?php echo $order_result[21]?>"><?php echo $order_result[22]?></a> <span style="color:#999;margin-left:10px">[<?php echo $order_result[23]?>]</span></td>
  </tr>
      <?php
    if($order_result[71]>0){
    ?>
    <tr bgcolor="#ffffff">
        <td height="30" align="center" bgcolor="#f3f3f3"><strong>财务确认订金到款：</strong></td>
        <td width="84%" align="left" style="padding:10px">
            <a href="user.php?c=amply&user_id=<?php echo $order_result[71]?>"><?php echo $order_result[72]?></a>
            <span style="color:#999;margin-left:10px">[<?php echo $order_result[74]?>]</span>
            <?php   if($_SESSION['organ_name']!='极米' ||  check_function(225) || $order_result['addition_id']==$_SESSION['user_id']){ ?>
                <div style="background:#f6f6f6;margin-top:10px;padding:5px">¥ <?php echo $order_result[73]?></div>
            <?php }else{ ?>
                <div style="background:#f6f6f6;margin-top:10px;padding:5px">***</div>
            <?php } ?>
        </td>
    </tr>
    <?php
    }?>
  <?php
  	if(($order_result[14]==1&&($order_result[19]==300||$order_result[19]==400))||$order_result[19]==700){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>财务确认到款：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<a href="user.php?c=amply&user_id=<?php echo $order_result[26]?>"><?php echo $order_result[27]?></a>
		<span style="color:#999;margin-left:10px">[<?php echo $order_result[24]?>]</span>
		<?php   if($_SESSION['organ_name']!='极米' ||  check_function(225) || $order_result['addition_id']==$_SESSION['user_id']){ ?>
		<div style="background:#f6f6f6;margin-top:10px;padding:5px">¥ <?php echo $order_result[25]?></div>
		<?php }else{ ?>
		<div style="background:#f6f6f6;margin-top:10px;padding:5px">
            <?php if($order_result['order_type_code'] == 0){
                    echo  '***<br/><span style="color:#ccc">(<span style="color:#0099FF">***</span>+<span style="color:red">'.(round($order_result['pay_money'],1) ? round($order_result['pay_money'],1) : round($order_result['order_money'],1)).'</span>)</span>';
                    }else{
                    echo '***';
                    }
            ?>

		</div>
		<?php } ?>
	</td>
  </tr>
  <?php
  	}
	if($order_result[28]){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>处理发货：</strong></td>
    <td width="84%" align="left"><a href="user.php?c=amply&user_id=<?php echo $order_result[28]?>"><?php echo $order_result[29]?></a> <span style="color:#999;margin-left:10px">[<?php echo $order_result[30]?>]</span></td>
  </tr>
  <?php
  	}
	if($order_result[31]){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递信息：</strong></td>
    <td width="84%" align="left"><?php
		echo $order_result[32].'：'.$order_result[33];
	 ?></td>
  </tr>
  <?php
  	if(!empty($order_result[34])){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递联系人：</strong></td>
    <td width="84%" align="left">
		<?php
			echo $order_result[34];
			if(!empty($order_result[35])){
		?>
		<span style="color:#999;margin-left:10px">[<?php echo $order_result[35]?>]</span>
		<?php
			}
		?>
	</td>
  </tr>
  <?php
  	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>预计到货时间：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[36]?></td>
  </tr>
  <?php
  	}
	if($order_result[19]==500||$order_result[19]==600){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>财务部确认订单需要退货：</strong></td>
    <td width="84%" align="left" style="padding:10px">
		<a href="user.php?c=amply&user_id=<?php echo $order_result[37]?>"><?php echo $order_result[38]?></a> <span style="color:#999;margin-left:10px">[<?php echo $order_result[39]?>]</span>
		<?php
			if(!empty($order_result[40])){
		?>
		<div style="margin-top:10px;padding:10px;background:#f3f3f3;color:#999"><?php echo $order_result[40]?></div>
		<?php
			}
		?>
	</td>
  </tr>
  <?php
  	}
	if($order_result[19]==600){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货部确认收到退货：</strong></td>
    <td width="84%" align="left"><a href="user.php?c=amply&user_id=<?php echo $order_result[41]?>"><?php echo $order_result[42]?></a> <span style="color:#999;margin-left:10px">[<?php echo $order_result[43]?>]</span></td>
  </tr>
  <?php
  	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[54]?></td>
  </tr>
  <?php
  	if(!$order_result['is_send']){
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>关联前是否允许发货：</strong></td>
    <td width="84%" align="left"><?php echo $order_result['is_allow_send']?'√':'×'?></td>
  </tr>
  <?php
  	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货关联关系：</strong></td>
    <td width="84%" align="left"><?php
		if($order_result['parent']){
			echo '附属订单，主订单为[<a href="?c=ample&order_id='.$order_result['parent'].'">'.$db->query('select order_code from orderform where id='.$order_result['parent'],true,true).'</a>]';
		}else{
			$child_order_reuslt = $db->query('select id,order_code from orderform where parent='.$order_result['id']);
			if(count($child_order_reuslt)){
				$child_order_html = array();
				foreach($child_order_reuslt as $child_order){
					$child_order_html[] = '<a href="?c=ample&order_id='.$child_order['id'].'">'.$child_order['order_code'].'</a>';
				}
				echo '主订单，附属订单有['.implode(' , ',$child_order_html).']';
			}else{
				echo '主订单';
			}
		}
	?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服指定快递公司：</strong></td>
    <td width="84%" align="left" style="padding:10px"><?php echo $order_result['assign_express_name']?'<span style="font-size:18px;color:#f30;font-weight:bold">'.$order_result['assign_express_name'].'</span>':'<span style="color:#ccc">未指定</span>'?></td>
  </tr>

 <?php if($_SESSION['is_super'] || (get_organ_info('name')=='舒卫能')){ ?>
<tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>活动标签：</strong></td>
    <td width="84%" align="left">
    <?php
       if(!$order_result[68]){
                echo '';
            }else{
               $active_tag_url=$db->query("select active_url from active_tag where id=".$order_result[68]." and is_valid=1",true);
               echo '<img src="'.$active_tag_url['active_url'].'" alt="" width="150" height="60"></td>';
            }
       ?>
  </tr>
<?php  } ?>

	<?php
		if(!empty($express_ename)){
			$service_logs_result = $db->query('select status,phase_index,phase_days,status,user_id,user_name,intro,add_time from order_service_logs where order_id='.$order_id.' and status in(0,3) order by id desc');
	?>
  <tr bgcolor="#ffffff" style="display:none;">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>售后回访记录：</strong></td>
    <td width="84%" align="left" style="color:#f90">
		<div style="margin-top:10px">
			<input type="button" value="添加回访记录" style="width:100px;height:30px" id="append_service_logs_btn" />
		</div>
		<div style="padding-bottom:10px;color:#666" id="service_logs_list">
			<?php
				foreach($service_logs_result as $service_logs){
			?>
			<div>
				<table width="100%" border="0" cellpadding="0" cellspacing="1">
					<tr>
						<td style="padding:10px 0 0 5px" align="left"><a href="user.php?c=amply&user_id=<?php echo $service_logs['user_id']?>"><?php echo $service_logs['user_name']?></a> <?php
							$phase_string = '<span style="color:#f74;margin:0 2px">'.$service_logs['phase_index'].'</span>';
							if($service_logs['status']){
								echo '完成'.$phase_string.'阶段回访任务';
							}else{
								echo '在'.$phase_string.'阶段手动添加回访记录';
							}
							if($service_logs['intro']){
								echo '<div style="color:#ccc;margin-top:5px;line-height:18px">'.nl2br(htmlspecialchars($service_logs['intro'])).'</div>';
							}
						?></td>
						<td style="padding:10px 5px 0 5px" align="right" valign="top"><?php echo $service_logs['add_time']?></td>
					</tr>
				</table>
			</div>
			<?php
				}
			?>
		</div>
	</td>
  </tr>
  <?php
  	}
  ?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单备注：</strong></td>
    <td width="84%" align="left" style="color:#f90"><?php echo nl2br($order_result[46])?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单操作日志：</strong></td>
    <td width="84%" align="left" style="padding-bottom:10px"><?php echo nl2br($order_result['order_logs'])?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单所属机构：</strong></td>
    <td width="84%" align="left"><?php echo $order_result[52]?></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单删除状态：</strong></td>
    <td width="84%" align="left" style="padding:10px">

		<?php echo !$order_result[45]?'<span style="color:#f00"><del>已删除</del></span>':'<span style="color:#093">正常</span>'?>
		<?php
			if($order_result[45]==0){
		?>
		<div style="margin-top:10px;background:#f6f6f6;padding:5px">
			<a href="user.php?c=amply&user_id=<?php echo $order_result[49]?>"><?php echo $order_result[50]?></a>
			<span style="color:#ccc;margin-left:5px">[<?php echo $order_result[51]?>]</span>
		</div>
		<?php
			}
		?>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="2" align="center" id="button_list">
		<?php
			if(check_function(52)){
				if(($order_result[19]==200 && $order_result[14]==0) || ($order_result[19]==700 && $order_result[14]==1)){
		?>
		<input type="button" value=" 修改快递信息 " onclick="<?php
					if($order_result['parent']){
						echo "if(confirm('该订单是附属订单，只有主订单才可以修改发货信息，你要转向主订单吗？')){
							location = '?c=ample&order_id=".$order_result['parent']."';
						}";
					}else{
						echo "location='?c=express&order_id=" . $order_result[47] . "'";
					}
		?>" />　
		<?php
				}
				if($order_result[19]==300||$order_result[19]==400){
		?>
		<input type="button" value=" 处理发货 " onclick="<?php
					if($order_result['parent']){
						echo "if(confirm('该订单是附属订单，只有主订单才可以处理发货，你要转向主订单吗？')){
							location = '?c=ample&order_id=".$order_result['parent']."';
						}";
					}else{
						echo "location='?c=send&order_id=" . $order_result[47] ."'";
					}
		?>" />　
		<?php
					$src = "wait";
				}
			}

			if(check_function(54)){
				if($order_result[19]==500){
		?>
		<input type="button" value=" 收到退货 " onclick="<?php
					if($order_result['parent']){
						echo "if(confirm('该订单是附属订单，只有主订单才可以处理发货，你要转向主订单吗？')){
							location = '?c=ample&order_id=".$order_result['parent']."';
						}";
					}else{
						echo "location='?c=set_return_stock&type=1&order_id=" . $order_result[47] . "'";
					}
		?>" />　
		<?php
					$src = "back";
				}
			}




            $src_list = $_GET['src_list'];
            if(empty($src_list))$src_list=encode($_SERVER['HTTP_REFERER']);
		?>
		<input type="button" value=" 修改订单" onclick="location='?c=amend&order_id=<?php echo $order_result[47]?>&src_list=<?php echo $src_list?>'" />　
		<input type="button" value=" 删除订单" onclick="window.remove('?c=remove&order_id=<?php echo $order_result[47]?>&src_list=<?php echo $src_list?>')" />
		<?php
			//}
		?>

	</td>
  </tr>
</table>
    <?php
        if($order_result[45]==0){
            echo "
            <script type=\"text/javascript\">
                var buttonList = $('button_list').getElementsByTagName('input');
                for(var i=0;i<buttonList.length;i++)buttonList[i].disabled=true;
            </script>
            ";
        }
    ?>
	</td>
  </tr>
</table>
<?php
}

function history($where=NULL){
	check_user(123);
?>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">发货历史记录列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">
  <tr bgcolor="#f3f3f3">
    <td height="30" align="center"><strong>序列</strong></td>
    <td align="center"><strong>订单编号</strong></td>
    <td align="center"><strong>发货单号</strong></td>
    <td align="center"><strong>产品名称</strong></td>
    <td align="center"><strong>产品疗程数量</strong></td>
    <td align="center"><strong>客户姓名</strong></td>
    <td align="center"><strong>客户地区</strong></td>
    <td align="center"><strong>快递公司</strong></td>
    <td align="center"><strong>发货时间</strong></td>
    </tr>
<?php
	include_once("include/page.php");
	$sql = "select order_id,order_code,express_order_code,product_id,product_name,product_package_count,guest_id,guest_name,guest_region_name,express_name,send_time from sendrecord where is_valid=1";

	if(empty($where)){
		if(empty($_GET['t'])){
			unset($_SESSION["w"]);
		}else{
			$where = $_SESSION["w"];
			$type_where = '&t=search';
		}
	}else{
		$_SESSION["w"] = $where;
		$type_where = '&t=search';
	}

	if(!empty($where)){
		$sql .= encode($where,false);
		$where = "w=".$where;
		//$param_list .= "&".$where;
	}
	$sql .= get_check_organ_sql(171)." order by id desc";
	$page = new page($sql,"c=history".$type_where);
	//$param_list = "offset=".$page->get_offset().$param_list;
	$page_result = $page -> get_result();
	foreach($page_result as $key => $row){
?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td align="center"><a href="order.php?c=amply&order_id=<?php echo $row[0]?>"><?php echo $row[1]?></a></td>
    <td align="center"><?php echo $row[2]?></td>
    <td align="center">
	<?php
		$db = new db(true);
		$gift_list = $db -> query("select product_id,product_name from gift where gift_type=1 and order_id=".$row[0]);
		foreach($gift_list as $gift){
	?>
	<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift[0]?>"><?php echo $gift[1]?></a></div>
	<?php
		}
	?>
	</td>
    <td align="center"><?php echo $row[5]?></td>
    <td align="center"><a href="user.php?c=amply&user_id=<?php echo $row[6]?>"><?php echo $row[7]?></a></td>
    <td align="center"><?php echo round_region($row[8])?></td>
    <td align="center"><?php echo $row[9]?></td>
    <td align="center"><?php echo $row[10]?></td>
    </tr>
<?php
	}
?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="9" align="center"><?php $page->show_guide()?></td>
    </tr>
</table>
</td>
  </tr>
</table>
<?php
}

function history_search(){
	check_user(124);
	$is_send_order_code = $_POST["is_send_order_code"];
	$is_product_id = $_POST["is_product_id"];
	$is_guest_name = $_POST["is_guest_name"];
	$is_guest_region = $_POST["is_guest_region"];
	$is_express_id = $_POST["is_express_id"];
	$is_send_date = $_POST["is_send_date"];
	$where_array = array();
	if($is_send_order_code){
		array_push($where_array,"express_order_code='".$_POST["send_order_code"]."'");
	}
	if($is_product_id){
		$db = new db(true,true);
		$product_id = $_POST["product_id"];
		$order_list = $db -> query("select order_id from gift where product_id=".$product_id);
		$order_array = array();
		foreach($order_list as $order_item){
			$order_array[$order_item[0]] = $order_item[0];
		}
		if(count($order_array)>0){
			array_push($where_array,"order_id in(".implode(",",$order_array).")");
		}
	}
	if($is_guest_name){
		array_push($where_array,"guest_name='".$_POST["guest_name"]."'");
	}
	if($is_guest_region){
		$sheng_code = $_POST["sheng"];
		$shi_code = $_POST["shi"];
		$xian_code = $_POST["xian"];
		if(empty($xian_code)){
			if(!empty($shi_code)){
				$region_string = "guest_region_code like'".$sheng_code.",".$shi_code.",%'";
			}else{
				if(!empty($sheng_code)){
					$region_string = "guest_region_code like'".$sheng_code.",%'";
				}
			}
		}else{
			$region_string = "guest_region_code='".$sheng_code.",".$shi_code.",".$xian_code."'";
		}
		array_push($where_array,$region_string);
	}
	if($is_express_id){
		$express_id = $_POST["express_id"];
		if($express_id=="all"){
			array_push($where_array,"express_id>0");
		}else{
			array_push($where_array,"express_id=".$express_id);
		}
	}
	if($is_send_date){
		array_push($where_array,"send_time>='".$_POST["begin_date"]."'");
		array_push($where_array,"send_time<='".$_POST["end_date"]." 23:59:59'");
	}
	foreach($where_array as $key => $value){
		$where .= " and ".$value;
	}
	if(!isset($where)){
		include_once("include/guide.php");
		$guide = new guide();
		$guide -> set_message("对不起，筛选条件为空或没有找到相关记录！",true);
		$guide -> append("继续筛选","?c=history_term");
		$guide -> append("发货记录列表","?c=history");
		$guide -> out();
	}
	history(encode($where));
}

function history_term(){
	check_user(124);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
	function checkForm(){
		var checkList = ["is_send_order_code","is_product_id","is_guest_name","is_guest_region","is_express_id","is_send_date"];
		var alertList = ["输入发货单号","选择产品","输入客户姓名","选择客户地区","选择快递公司"];
		var choosedList = [];
		var isExists = false;
		for(var i=0;i<checkList.length;i++){
			if(document.forms[0].elements[checkList[i]].checked){
				var checkName = checkList[i].replace("is_","");
				if(checkName=="guest_region")checkName="sheng";
				isExists = true;
				choosedList.push([checkName,i]);
			}
		}
		if(isExists){
			for(var i=0;i<choosedList.length;i++){
				if(choosedList[i][0]=="send_date"){
					var beginDate = document.forms[0].elements["begin_date"].value;
					var endDate = document.forms[0].elements["end_date"].value;
					if(beginDate==""){
						alert("请选择开始始时间！");
						return;
					}
					if(endDate==""){
						alert("请选择结束时间！");
						return;
					}
					beginDateArray = beginDate.split("-");
					beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
					endDateArray = endDate.split("-");
					endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
					if(Date.parse(beginDate)>Date.parse(endDate)){
						alert("开始时间不能大于结束时间！");
						return;
					}
				}else{
					if(document.forms[0].elements[choosedList[i][0]].value==""){
						alert("请"+alertList[choosedList[i][1]]+"！");
						return;
					}
				}
			}
			with(document.forms[0]){
				action = "?c=history_search";
				method = "post";
				submit();
			}
		}else{
			alert("请至少选择一个筛选条件！");
		}
	}

	window.onload=function(){

		autoChoose({

			'product_class'		:	'product_id',
			'sheng'				:	'guest_region',
			'begin_date'		:	'send_date',
			'end_date'			:	'send_date'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">发货记录筛选器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
	<div style="color:#f00;font-size:20px;padding-bottom:10px">特别提醒：此数据只做参考之用，如发现与订单数据不匹配的情况，请以订单为准！</div>
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_order_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货单号：</strong></td>
    <td width="75%" align="left"><input type="text" name="send_order_code" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品名称：</strong></td>
    <td width="75%" align="left">
		<script type="text/javascript" src="js/product.php"></script>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_name" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="75%" align="left"><input name="guest_name" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_region" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户地区：</strong></td>
    <td width="75%" align="left">
		<script src="js/region.php"></script>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司：</strong></td>
    <td width="75%" align="left">
	<select name="express_id">
	<option value="all">所有快递公司</option>
	<?php
		$db = new db(true);
		$result = $db -> query("select id,express_name from express where is_valid=1".get_check_organ_sql(172)." order by order_index asc,id asc");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td width="75%" align="left"><input name="begin_date" type="text" id="begin_date" onclick="showCalendar('begin_date','%Y-%m-%d',false,false,'begin_date')" size="10" readonly="true"/> — <input name="end_date" type="text" id="end_date" onclick="showCalendar('end_date','%Y-%m-%d',false,false,'end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 筛 选 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function search_not_dispose(){
	check_user(62);
	$db = new db(true);
	if($_GET["method"]=="post"){
		$is_order_type = $_POST["is_order_type"];
		$is_express = $_POST["is_express"];
		$is_send_order_code = $_POST["is_send_order_code"];
		$is_guest_name = $_POST["is_guest_name"];
		$is_order_money = $_POST["is_order_money"];
		$is_send_date = $_POST["is_send_date"];
		$is_waiter = $_POST["is_waiter"];
		$where_array = array();
		if($is_order_type){
			$order_type = $_POST["order_type"];
			array_push($where_array,"order_type_code=".$order_type);
			if($order_type){
				$command = "money";
			}else{
				if($is_express){
					$express_id = $_POST["express"];
					array_push($where_array,"express_id=".$express_id);
				}
				if($is_send_order_code){
					$send_order_code = $_POST["send_order_code"];
					array_push($where_array,"express_order_code='".$send_order_code."'");
				}
				if($is_send_date){
					$send_begin_date = $_POST["send_begin_date"];
					$send_end_date = $_POST["send_end_date"];
					array_push($where_array,"send_time>='".$send_begin_date."'");
					array_push($where_array,"send_time<='".$send_end_date." 23:59:59'");
				}
				$command = "goods";
			}
		}
		if($is_guest_name){
			$guest_name = $_POST["guest_name"];
			array_push($where_array,"guest_name='".$guest_name."'");
		}
		if($is_waiter){
			$waiter = $_POST["waiter"];
			array_push($where_array,"addition_id=".$waiter);
		}
		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

			$product_list=implode(',',array_strip($product_array));

		}

		if($product_list){
			array_push($where_array,"product_id in (".$product_list.")");
		}
		$where = implode(" and ",$where_array);
		if(!empty($where))$where = "&w=".encode($where);
		header("location:?c=".$command.$where);
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
	function compareDate(beginDate,endDate){
		var beginDateArray = beginDate.split("-");
		beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
		var endDateArray = endDate.split("-");
		endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
		return Date.parse(beginDate)>Date.parse(endDate);
	}
	function checkForm(){
		with(document.forms[0]){
			if($("order_type0").checked){
				if(is_express.checked){
					if(express.value==""){
						alert("请选择快递公司！");
						return;
					}
				}
				if(is_send_order_code.checked&&document.forms[0].express.value!=7){
					if(send_order_code.value==""){
						alert("请输入发货单号！");
						return;
					}
				}
			}
			if(is_guest_name.checked){
				if(guest_name.value==""){
					alert("请输入客户姓名！");
					return;
				}
			}
			if(is_order_money.checked){
				if(order_money.value==""){
					alert("请输入订单金额！");
					return;
				}
				if(!/^\d+(?:\.\d+)?$/.test(order_money.value)){
					alert("订单金额必须为数字！");
					return;
				}
			}
			if($("order_type0").checked){
				if(is_send_date.checked){
					if(send_begin_date.value==""){
						alert("请选择发货开始时间！");
						return;
					}
					if(send_end_date.value==""){
						alert("请选择发货结束时间！");
						return;
					}
					if(compareDate(send_begin_date.value,send_end_date.value)){
						alert("发货开始时间不能大于结束时间！");
						return;
					}
				}
			}
			if(is_waiter.checked){
				if(waiter.value==""){
					alert("请选择客服！");
					return;
				}
			}
			action = "?c=search_not_dispose&method=post";
			method = "post";
			submit();
		}
	}
	function changeType(t){
		var elementArray = ["express","send_order_code","send_date"];
		var attribute = t?"none":"";
		for(var i=0;i<elementArray.length;i++){
			if(attribute==""&&document.forms[0].express.value==7&&elementArray[i]=="send_order_code")continue;
			$(elementArray[i]+"_tr").style.display = attribute;
		}
	}
	function checkExpress(value){
		$("send_order_code_tr").style.display = value==7?"none":"";
	}

	window.onload=function(){

		autoChoose({

			'send_begin_date'	:	'send_date',
			'send_end_date'		:	'send_date'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">财务查找未确认的订单</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_type" value="true" onclick="if(!this.checked)this.checked=true" checked="checked" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单类型：</strong></td>
    <td width="75%" align="left" style="padding:5px">
		<input type="radio" name="order_type" value="0" id="order_type0" checked="checked" onclick="changeType(0)" /><label for="order_type0">货到付款</label>
		<input type="radio" name="order_type" value="1" id="order_type1" onclick="changeType(1)" /><label for="order_type1">款到发货</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff" id="express_tr">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司：</strong></td>
    <td width="75%" align="left">
	<select name="express" onchange="checkExpress(this.value)">
	<option value="all">所有快递公司</option>
	<?php
		$result = $db -> query("select id,express_name from express where is_valid=1".get_check_organ_sql(172).' order by order_index asc,id asc');
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>	</td>
  </tr>
  <tr bgcolor="#ffffff" id="send_order_code_tr">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_order_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货单号：</strong></td>
    <td align="left"><input name="send_order_code" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_name" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="75%" align="left"><input name="guest_name" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_money" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单金额：</strong></td>
    <td width="75%" align="left"><input name="order_money" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff" id="send_date_tr">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td align="left"><input name="send_begin_date" type="text" id="send_begin_date" onclick="showCalendar('send_begin_date','%Y-%m-%d',false,false,'send_begin_date')" size="10" readonly="true"/>—<input name="send_end_date" type="text" id="send_end_date" onclick="showCalendar('send_end_date','%Y-%m-%d',false,false,'send_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_waiter" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服人员：</strong></td>
    <td width="75%" align="left">
	<select name="waiter">
	<option value="">请选择客服人员</option>
	<?php
		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

			$user_list=implode(',',array_strip($user_array));

		}

		if($user_list){
			$where_user=" and user.id in (".$user_list.")";
		}
		$result = $db -> query("select user.id,user.name,user.enable,organ.name from user inner join organ on organ.id=user.organ_id where user.group_id=1 and user.is_valid=1".$where_user." order by enable desc,organ.id,user.name");
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\"";
			if(!$row[2])echo ' style="color:#ccc"';
			echo ">".$row[1]." [" . $row[3] . "]</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 查 找 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function finance_search_term(){
	check_user(66);
	$db = new db(true);
	if($_GET["method"]=="post"){
		$is_order_state = $_POST["is_order_state"];
		$is_order_type = $_POST["is_order_type"];
		$is_waiter = $_POST["is_waiter"];
		$is_express = $_POST["is_express"];
		$is_guest_name = $_POST["is_guest_name"];
		$is_order_code = $_POST["is_order_code"];
		$is_send_order_code = $_POST["is_send_order_code"];
		$is_add_date = $_POST["is_add_date"];
		$is_send_date = $_POST["is_send_date"];
		$is_money_date = $_POST["is_money_date"];
		$is_return_finance_date = $_POST["is_return_finance_date"];
		$is_return_sender_date = $_POST["is_return_sender_date"];
		$is_order_channel_id = $_POST['is_order_channel_id'];
		$is_organ = $_POST["is_organ"];
		$is_order_delete_state = $_POST["is_order_delete_state"];
		$where_array = array();
		if($is_order_state){
			$order_state = $_POST["order_state"];
			switch($order_state){
				case "0":
					array_push($where_array,"order_state_code=700");
					break;
				case "1":
					array_push($where_array,"order_state_code=600");
					break;
				case "2":
					array_push($where_array,"order_state_code=200 and order_type_code=0");
					break;
				case "3":
					array_push($where_array,"order_state_code=500 and order_type_code=0");
					break;
				case "4":
					array_push($where_array,"(((order_state_code=200 or order_state_code=500 or order_state_code=600) and order_type_code=0) or order_state_code=700)");
					break;
			}
		}
		if($is_order_type){
			$order_type = $_POST["order_type"];
			array_push($where_array,"order_type_code=".$order_type);
			if($order_type){
				$bank_name = $_POST["bank_name"];
				$bank_code = $_POST["bank_code"];
				if(!empty($bank_name)){
					array_push($where_array,"money_bank_name='".$bank_name."'");
					array_push($where_array,"money_bank_code='".$bank_code."'");
				}
			}
		}
		if($is_waiter){
			$waiter = $_POST["waiter"];
			array_push($where_array,"addition_id=".$waiter);
		}
		if($is_express){
			$express_id = $_POST["express"];
			if($express_id!='all')array_push($where_array,"express_id=".$express_id);
		}
		if($is_order_code){
			$order_code = $_POST["order_code"];
			array_push($where_array,"order_code='".$order_code."'");
		}
		if($is_guest_name){
			$guest_name = $_POST["guest_name"];
			array_push($where_array,"guest_name='".$guest_name."'");
		}
		if($is_send_order_code){
			$send_order_code = $_POST["send_order_code"];
			array_push($where_array,"express_order_code='".$send_order_code."'");
		}
		if($is_add_date){
			$add_begin_date = $_POST["add_begin_date"];
			$add_begin_hour = $_POST['add_begin_hour'];
			$add_begin_minute = $_POST['add_begin_minute'];

			$add_end_date = $_POST["add_end_date"];
			$add_end_hour = $_POST['add_end_hour'];
			$add_end_minute = $_POST['add_end_minute'];


			if(!empty($add_begin_hour)){
				if(empty($add_begin_minute)){
					$add_begin_minute = 0;
				}
				$add_begin_date .= " $add_begin_hour:$add_begin_minute:0";
			}
			if(!empty($add_end_hour)){
				if(empty($add_end_minute)){
					$add_end_minute = 59;
				}
			}else{
				$add_end_hour = 23;
				$add_end_minute = 59;
			}
			$add_end_date .= " $add_end_hour:$add_end_minute:59";

			array_push($where_array,"add_time>='$add_begin_date'");
			array_push($where_array,"add_time<='$add_end_date'");

			//array_push($where_array,"add_time>='".$add_begin_date."'");
			//array_push($where_array,"add_time<='".$add_end_date." 23:59:59'");
		}
		if($is_send_date){
			$send_begin_date = $_POST["send_begin_date"];
			$send_begin_hour = $_POST['send_begin_hour'];
			$send_begin_minute = $_POST['send_begin_minute'];
			$send_end_date = $_POST["send_end_date"];
			$send_end_hour = $_POST['send_end_hour'];
			$send_end_minute = $_POST['send_end_minute'];
			if(!empty($send_begin_hour)){
				if(empty($send_begin_minute)){
					$send_begin_minute = 0;
				}
				$send_begin_date .= " $send_begin_hour:$send_begin_minute:0";
			}
			if(!empty($send_end_hour)){
				if(empty($send_end_minute)){
					$send_end_minute = 59;
				}
			}else{
				$send_end_hour = 23;
				$send_end_minute = 59;
			}
			$send_end_date .= " $send_end_hour:$send_end_minute:59";
			array_push($where_array,"send_time>='$send_begin_date'");
			array_push($where_array,"send_time<='$send_end_date'");

			/*$send_begin_date = $_POST["send_begin_date"];
			$send_end_date = $_POST["send_end_date"];
			array_push($where_array,"send_time>='".$send_begin_date."'");
			array_push($where_array,"send_time<='".$send_end_date." 23:59:59'");*/
		}
		if($is_money_date){
			$money_begin_date = $_POST["money_begin_date"];
			$money_end_date = $_POST["money_end_date"];
			array_push($where_array,"money_fact_time>='".$money_begin_date."'");
			array_push($where_array,"money_fact_time<='".$money_end_date." 23:59:59'");
		}
		if($is_return_finance_date){
			$return_finance_begin_date = $_POST["return_finance_begin_date"];
			$return_finance_end_date = $_POST["return_finance_end_date"];
			array_push($where_array,"return_finance_time>='".$return_finance_begin_date."'");
			array_push($where_array,"return_finance_time<='".$return_finance_end_date." 23:59:59'");
		}
		if($is_return_sender_date){
			$return_sender_begin_date = $_POST["return_sender_begin_date"];
			$return_sender_end_date = $_POST["return_sender_end_date"];
			array_push($where_array,"return_sender_time>='".$return_sender_begin_date."'");
			array_push($where_array,"return_sender_time<='".$return_sender_end_date." 23:59:59'");
		}

		if($is_order_channel_id){
			$order_channel_id = $_POST["order_channel_id"];
			array_push($where_array,"order_channel_id=".$order_channel_id);
		}

		if($is_organ){
			$organ_id = $_POST["organ"];
			array_push($where_array,"organ_id=".$organ_id);
		}

		if($is_order_delete_state){
			$order_delete_state = $_POST["order_delete_state"];
			array_push($where_array,"is_valid=".$order_delete_state);
		}

		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

			$product_list=implode(',',array_strip($product_array));

		}

		if($product_list){
			array_push($where_array,"product_id in (".$product_list.")");
		}

		$where = implode(" and ",$where_array);
		if(!empty($where))$where = "&w=".encode($where);
		header("location:?c=finance_search".$where);
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
	function compareDate(beginDate,endDate){
		var beginDateArray = beginDate.split("-");
		beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
		var endDateArray = endDate.split("-");
		endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
		return Date.parse(beginDate)>Date.parse(endDate);
	}
	function checkForm(){
		with(document.forms[0]){
			if(is_waiter.checked){
				if(waiter.value==""){
					alert("请选择客服！");
					return;
				}
			}
			if(is_express.checked){
				if(express.value==""){
					alert("请选择快递公司！");
					return;
				}
			}
			if(is_order_code.checked){
				if(order_code.value==""){
					alert("请输入订单编号");
					return;
				}
			}
			if(is_guest_name.checked){
				if(guest_name.value==""){
					alert("请输入客户姓名！");
					return;
				}
			}
			if(is_send_order_code.checked){
				if(send_order_code.value==""){
					alert("请输入发货单号！");
					return;
				}
			}
			if(is_send_date.checked){
				if(send_begin_date.value==""){
					alert("请选择发货开始时间！");

					return;
				}
				if(send_end_date.value==""){
					alert("请选择发货结束时间！");
					return;
				}
				if(compareDate(send_begin_date.value,send_end_date.value)){
					alert("发货开始时间不能大于结束时间！");
					return;
				}
			}
			if(is_add_date.checked){
				if(add_begin_date.value==""){
					alert("请选择添加开始时间！");
					return;
				}
				if(add_end_date.value==""){
					alert("请选择添加结束时间！");
					return;
				}
				if(compareDate(add_begin_date.value,add_end_date.value)){
					alert("添加开始时间不能大于结束时间！");
					return;
				}
			}
			if(is_money_date.checked){
				if(money_begin_date.value==""){
					alert("请选择收款开始时间！");
					return;
				}
				if(money_end_date.value==""){
					alert("请选择收款结束时间！");
					return;
				}
				if(compareDate(money_begin_date.value,money_end_date.value)){
					alert("收款开始时间不能大于结束时间！");
					return;
				}
			}
			if(is_return_finance_date.checked){
				if(return_finance_begin_date.value==""){
					alert("请选择财务部处理退货开始时间！");
					return;
				}
				if(return_finance_end_date.value==""){
					alert("请选择财务部处理退货结束时间！");
					return;
				}
				if(compareDate(return_finance_begin_date.value,return_finance_end_date.value)){
					alert("财务部处理退货开始时间不能大于结束时间！");
					return;
				}
			}
			if(is_return_sender_date.checked){
				if(return_sender_begin_date.value==""){
					alert("请选择发货部确认退货开始时间！");
					return;
				}
				if(return_sender_end_date.value==""){
					alert("请选择发货部确认退货结束时间！");
					return;
				}
				if(compareDate(return_sender_begin_date.value,return_sender_end_date.value)){
					alert("发货部确认退货开始时间不能大于结束时间！");
					return;
				}
			}

			if(is_order_channel_id.checked){
				if(order_channel_id.value==''){
					alert('请选择订购渠道！');
					return;
				}
			}

			if(is_organ.checked){
				if(organ.value==''){
					alert("请选择所属机构！");
					return;
				}
			}
			action = "?c=finance_search_term&method=post";
			method = "post";
			submit();
		}
	}

	window.onload=function(){

		autoChoose({

			'send_begin_date'			:	'send_date',
			'send_begin_hour'			:	'send_date',
			'send_begin_minute'			:	'send_date',
			'send_end_date'				:	'send_date',
			'send_end_hour'				:	'send_date',
			'send_end_minute'			:	'send_date',

			'add_begin_date'			:	'add_date',
			'add_begin_hour'			:	'send_date',
			'add_begin_minute'			:	'send_date',
			'add_end_date'				:	'add_date',
			'add_end_hour'				:	'send_date',
			'add_end_minute'			:	'send_date',


			'money_begin_date'			:	'money_date',
			'money_end_date'			:	'money_date',

			'return_finance_begin_date'	:	'return_finance_date',
			'return_finance_end_date'	:	'return_finance_date',

			'return_sender_begin_date'	:	'return_sender_date',
			'return_sender_end_date'	:	'return_sender_date',

			'order_channel_id'	:	'order_channel_id'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">财务订单统计筛选器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
 <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单编号：</strong></td>
    <td width="75%" align="left"><input name="order_code" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_state" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单状态：</strong></td>
    <td width="75%" align="left">
	<select name="order_state">
		<option value="0">已完成的订单</option>
		<option value="1">已退货的订单</option>
		<option value="2">发货未到款的订单</option>
		<option value="3">未收到退货的订单</option>
		<option value="4">所有已发货的订单</option>
    </select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_type" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单类型：</strong></td>
    <td width="75%" align="left" style="padding:5px">
		<input type="radio" name="order_type" value="0" id="order_type0" checked="checked" onclick="$('bank').style.display='none'" /><label for="order_type0">货到付款</label>
		<input type="radio" name="order_type" value="1" id="order_type1" onclick="$('bank').style.display=''" /><label for="order_type1">款到发货</label>
		<div id="bank" style="margin-top:5px;display:none">
			<select onchange="var bank_array=this.value.split('|');$('bank_name').value=bank_array[0];$('bank_code').value=bank_array[1];">
			<option value="|">请选择查询帐号</option>
			<?php
			//$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1".get_check_organ_sql(173));
			//暂时不判断机构了
			$banks = $db -> query("select bank_byname,bank_name,bank_code from bank where is_valid=1");
				foreach($banks as $bank){
					echo "<option value=\"".$bank[1]."|".$bank[2]."\" title=\"\n　[".$bank[1]."]".$bank[2]."　\n\">".$bank[0]."</option>";
				}
			?>
			<option value="其他银行|其他帐号">其他帐号</option>
			</select>
			<input name="bank_name" id="bank_name" type="hidden" />
			<input name="bank_code" id="bank_code" type="hidden" />
		</div>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_waiter" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服人员：</strong></td>
    <td width="75%" align="left">
	<select name="waiter">
	<option value="">请选择客服人员</option>
	<?php
		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

			$user_list=implode(',',array_strip($user_array));

		}

		if($user_list){
			$where_user=" and user.id in (".$user_list.")";
		}

		$result = $db -> query("select user.id,user.name,user.enable,organ.name from user inner join organ on organ.id=user.organ_id where user.group_id=1 and user.is_valid=1".$where_user." order by enable desc,organ.id,user.name");

		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\"";
			if(!$row[2])echo ' style="color:#ccc"';
			echo ">".$row[1]." [" . $row[3] . "]</option>\n";
		}
	?>
	</select> (灰色代表已离职被禁用的客服人员)
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_express" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>快递公司：</strong></td>
    <td width="75%" align="left">
	<select name="express">
	<option value="all">所有快递公司</option>
	<?php
		$result = $db -> query("select id,express_name from express where is_valid=1".get_check_organ_sql(172).' order by order_index asc,id asc');
		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\">".$row[1]."</option>\n";
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_guest_name" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客户姓名：</strong></td>
    <td width="75%" align="left"><input name="guest_name" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_order_code" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货单号：</strong></td>
    <td align="left"><input name="send_order_code" type="text" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_add_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>添加时间：</strong></td>
    <td align="left"><input name="add_begin_date" type="text" id="add_begin_date" onclick="showCalendar('add_begin_date','%Y-%m-%d',false,false,'add_begin_date')" size="10" readonly="true"/>
     <script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';
			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="add_begin_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="add_begin_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	—<input name="add_end_date" type="text" id="add_end_date" onclick="showCalendar('add_end_date','%Y-%m-%d',false,false,'add_end_date')" size="10" readonly="true"/>
     <script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';
			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="add_end_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="add_end_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td align="left"><input name="send_begin_date" type="text" id="send_begin_date" onclick="showCalendar('send_begin_date','%Y-%m-%d',false,false,'send_begin_date')" size="10" readonly="true"/>
    <script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';
			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="send_begin_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="send_begin_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
    —<input name="send_end_date" type="text" id="send_end_date" onclick="showCalendar('send_end_date','%Y-%m-%d',false,false,'send_end_date')" size="10" readonly="true"/>
     <script type="text/javascript">
			var hourOptions = '';
			var minuteOptions = '';
			for(var i=0;i<24;i++){
				hourOptions += '<option value="'+i+'">'+i+'</option>';
			}
			for(var i=0;i<60;i++){
				minuteOptions += '<option value="'+i+'">'+i+'</option>';
			}
		</script>
		<select name="send_end_hour">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(hourOptions);
			</script>
		</select>点
		<select name="send_end_minute">
			<option value="">--</option>
			<script type="text/javascript">
				document.write(minuteOptions);
			</script>
		</select>分
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_money_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收款时间：</strong></td>
    <td align="left"><input name="money_begin_date" type="text" id="money_begin_date" onclick="showCalendar('money_begin_date','%Y-%m-%d',false,false,'money_begin_date')" size="10" readonly="true"/>—<input name="money_end_date" type="text" id="money_end_date" onclick="showCalendar('money_end_date','%Y-%m-%d',false,false,'money_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_return_finance_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>财务部处理退货时间：</strong></td>
    <td align="left"><input name="return_finance_begin_date" type="text" id="return_finance_begin_date" onclick="showCalendar('return_finance_begin_date','%Y-%m-%d',false,false,'return_finance_begin_date')" size="10" readonly="true"/>—<input name="return_finance_end_date" type="text" id="return_finance_end_date" onclick="showCalendar('return_finance_end_date','%Y-%m-%d',false,false,'return_finance_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_return_sender_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货部确认退货时间：</strong></td>
    <td align="left"><input name="return_sender_begin_date" type="text" id="return_sender_begin_date" onclick="showCalendar('return_sender_begin_date','%Y-%m-%d',false,false,'return_sender_begin_date')" size="10" readonly="true"/>—<input name="return_sender_end_date" type="text" id="return_sender_end_date" onclick="showCalendar('return_sender_end_date','%Y-%m-%d',false,false,'return_sender_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_channel_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="75%" align="left">
	<?php
	$order_channel_result = $db -> query("select id,name from order_channel where is_valid = 1");
	?>
	<select name="order_channel_id">
	<option value="">选择订购渠道</option>
	<?php
		foreach($order_channel_result as $order_channel_item){
	?>
	<option value="<?php echo $order_channel_item[0]?>"><?php echo $order_channel_item[1]?></option>
	<?php
		}
	?>
    </select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_organ" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="75%" align="left">
		<?php
			organ_select(171);
		?>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_delete_state" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>删除状态：</strong></td>
    <td width="75%" align="left">
		<select name="order_delete_state">
			<option value="1">未删除的订单</option>
			<option value="0">已删除的订单</option>
		</select>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 筛 选 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function finance_search(){
	check_user();
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">财务订单列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">

  <tr bgcolor="#f3f3f3">
    <td width="5%" height="30" align="center"><strong>序列</strong></td>
    <td width="11%" align="center"><strong>订单编号</strong></td>
    <td width="9%" align="center"><strong>产品名称</strong></td>
    <td width="8%" align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
    <td width="10%" align="center"><strong>客户姓名</strong></td>
    <td width="11%" align="center"><strong>联系方式</strong></td>
    <td width="14%" align="center"><strong>付款方式</strong></td>
    <td width="15%" align="center"><strong>订单状态</strong></td>
    <td width="10%" align="center"><strong>关联关系</strong></td>
    <td width="8%" align="center"><strong>选择</strong></td>
  </tr>
<?php
	include_once("include/page.php");
	$sql = "select id,order_code,order_name,product_id,product_name,order_money,guest_id,guest_name,guest_contact,order_type_code,order_type_name,order_state_code,order_state_name,is_valid,parent,reserve_money,pay_money from orderform";
	$where = $_GET["w"];
	if(!empty($where)){
		$sql_where = encode($where,false);
		$sql .= " where ".$sql_where;
		$sql_where .= get_check_organ_sql(171);
		$where = "&w=".$where;
		$output_param = encode(iconv("utf-8","gbk",preg_replace("/(?: and )?is_valid=[01]/","",$sql_where)));
		if(!empty($output_param))$output_param = "&w=".$output_param;
		$param_list .= "&".$where;
	}
	$sql .= get_check_organ_sql(171,'organ_id',(empty($sql_where)?' where ':' and '));
	$sql .= " order by id desc";
	$page = new page($sql,"c=finance_search".$where);
	$param_list = "offset=".$page->get_offset().$param_list;
	$page_result = $page -> get_result(false);
	foreach($page_result as $key => $row){
?>
  <tr bgcolor="#ffffff"<?php
  	if($row[13]==0)echo " class=\"deleted\"";
  ?>>
    <td width="5%" height="30" align="center"><?php echo $page->get_offset()+$key+1?></td>
    <td width="11%" align="center"><a href="order.php?c=amply&order_id=<?php echo $row[0]?>"><?php echo $row[1]?></a></td>
	<td width="9%" align="center">
	<?php
		$db = new db(true);
		$gift_list = $db -> query("select product_id,product_name from gift where gift_type=1 and order_id=".$row[0]);
		foreach($gift_list as $gift){
	?>
	<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift[0]?>"><?php echo $gift[1]?></a></div>
	<?php
		}
	?>	</td>
    <td align="center"><?php if($row[9] == 0){echo  (round($row[5],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($row[15],1).'</span>+<span style="color:red">'.(round($row[16],1) ? round($row[16],1) : round($row[5],1))).'</span>)</span>');}else{echo round($row[5],1);}?></td>
    <td width="10%" align="center"><a href="guest.php?c=amply&guest_id=<?php echo $row[6]?>"><?php echo $row[7]?></a></td>
    <td width="11%" align="center"><?php echo $row[8]?></td>
    <td width="14%" align="center"><?php echo $row[10]?></td>
    <td width="15%" align="center"><?php
		if($row[9]==0&&$row[11]==200){
			echo "已发货,";
		}
	 echo $row[12]?></td>
    <td width="10%" align="center"><?php echo $row['parent']?'<span style="color:#ccc">附属订单</span>':'主订单'?></td>
    <td align="center"><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row[0]?>" /></td>
  </tr>
<?php
}
?>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="10" align="center"><?php $page->show_guide()?></td>
    </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="10" align="center">
		导出报表：
		<select id="output_command">
			<option value="">请选择生成报表类型</option>
			<option value="rude_total_term">客服订单统计报表(订单价格为0的不计算在内)</option>
			<option value="ample_total_term">客服订单详细列表(订单价格为0的不计算在内)</option>
			<option value="product_total_table">客服按产品分组统计报表</option>
			<option value="express_workbook">快递发货订单报表</option>
			<option value="total_bank_money">银行到款统计报表</option>
		</select>　
		<input type="button" onclick="if($('output_command').value!='')window.open('excel.php?c='+$('output_command').value+'<?php echo $output_param?>')" value="导出报表" />　
		<input type="button" onclick="command('?c=amend_order_flow&<?php echo get_common_param()?>')" value="回滚订单流程" /></td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>

<?php
}

function amend_order_flow(){
	check_user(162);
	$db = new db(true);
	$order_id = get_selected(false,1);
	if(empty($order_id))$order_id = $_GET['order_id'];
	$order_result = $db -> query('SELECT order_type_code,order_state_code,order_state_name,parent FROM orderform WHERE id='.$order_id,true);
	include("include/guide.php");
	$guide = new guide();

	$is_valid=true;

	if($order_result[0]==1||$order_result[0]==0&&!in_array($order_result[1],array(500,600,700))){
		$guide -> set_message('该订单不符合回滚流程的要求！',true);
		$is_valid=false;
	}

	if($order_result['parent']){
		$guide -> set_message('对不起，该订单是附属订单，不能单独处理回滚流程！',true);
		$is_valid=false;
	}

	if(!$is_valid){
		$guide -> append('返回订单列表','?c=finance_search&'.get_common_param());
		$guide -> out();
	}

	if($_GET['method']=='post'){
		$old_order_state_code = $_POST['old_order_state_code'];
		$new_order_state_code = $_POST['new_order_state_code'];
		$update_item_array = array();



		$update_values = array();

		$update_values['old_order_state_code'] = $old_order_state_code;
		if($old_order_state_code=='700'){//完成的订单
			if($new_order_state_code=='200'){//转未处理状态
				array_push($update_item_array,"order_state_code=200");
				array_push($update_item_array,"order_state_name='等待财务确认到款'");
				$update_values['order_state_code'] = 200;
				$update_values['order_state_name'] = '等待财务确认到款';
			}elseif($new_order_state_code=='500'){//转退货状态
				array_push($update_item_array,"order_state_code=500");
				array_push($update_item_array,"order_state_name='等待发货部确认收到退货'");
				array_push($update_item_array,"return_finance_id=money_manager_id");//设置处理退货财务ID为处理到款财务ID
				array_push($update_item_array,"return_finance_name=money_manager_name");//设置处理退货财务姓名为处理到款财务姓名
				array_push($update_item_array,"return_finance_time=money_fact_time");//设置财务处理退货时间为处理到款时间
				$update_values['order_state_code'] = 500;
				$update_values['order_state_name'] = '等待发货部确认收到退货';
			}
			array_push($update_item_array,"money_manager_id=NULL");//清空处理到款财务ID
			array_push($update_item_array,"money_manager_name=NULL");//清空处理到款财务姓名
			array_push($update_item_array,"money_fact_time=NULL");//清空财务处理到款时间
			array_push($update_item_array,"money_fact_count=NULL");//清空实际到款数量
		}else{//退货的订单
			if($new_order_state_code=='200'){//转未处理状态
				array_push($update_item_array,"order_state_code=200");//设置订单状态号码
				array_push($update_item_array,"order_state_name='等待财务确认到款'");//设置订单状态名称
				$update_values['order_state_code'] = 200;
				$update_values['order_state_name'] = '等待财务确认到款';
			}elseif($new_order_state_code=='700'){//转到完成状态
				array_push($update_item_array,"order_state_code=700");
				array_push($update_item_array,"order_state_name='已完成'");
				array_push($update_item_array,"money_manager_id=return_finance_id");//设置处理到款财务ID为处理退货财务ID
				array_push($update_item_array,"money_manager_name=return_finance_name");//设置到款财务姓名为处理退货财务姓名
				array_push($update_item_array,"money_fact_time=return_finance_time");//设置处理到款时间为处理退货的时间
				array_push($update_item_array,"money_fact_count=order_money");//设置实际到款数量
				$update_values['order_state_code'] = 700;
				$update_values['order_state_name'] = '已完成';
			}
			array_push($update_item_array,"return_finance_id=NULL");//清空处理退货财务ID
			array_push($update_item_array,"return_finance_name=NULL");//清空处理退货财务姓名
			array_push($update_item_array,"return_finance_time=NULL");//清空处理退货时间
			array_push($update_item_array,"return_reason=NULL");//清空退货原因
			if($old_order_state_code=='600'){//如果已经完成退货
				array_push($update_item_array,"return_sender_id=NULL");//清空确认收到退货的发货部ID
				array_push($update_item_array,"return_sender_name=NULL");//清空确认收到退货的发货部姓名
				array_push($update_item_array,"return_sender_time=NULL");////清空确认收到退货时间
			}
		}
		$db -> execute('UPDATE orderform SET '.implode(',',$update_item_array).' WHERE id='.$order_id);

		//记录更新数据的日志数组
		$data_update_logs_array = array();

		//将修改客户的数据加入到更新日志
		$data_update_logs_array['update_orderform'] = array(
			'data'	=>	$update_values,
			'where'	=>	array(
				'order_id'	=>	$order_id,
			),
		);

		//将更新数据写入到日志文件中
		append_update_logs('amend_order_status',$data_update_logs_array);



		$guide -> append('订单列表','?c=finance_search&'.get_common_param());
		$guide -> append('订单详细页','?c=amply&order_id='.$order_id);
		$guide -> set_message('订单状态回滚设置成功！');
		$guide -> out();
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript">
	function checkForm(){
		$('submit_btn').disabled=true;
		with(document.forms[0]){
			method = 'post';
			action = '?<?php echo $_SERVER['QUERY_STRING']?>&order_id=<?php echo $order_id?>&method=post';
			submit();
		}
	}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">回滚订单流程</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td width="18%" height="30" align="center" bgcolor="#f3f3f3"><strong>当前订单状态：</strong></td>
    <td width="82%" align="left" style="padding:5px"><?php echo $order_result[2]?><input type="hidden" name="old_order_state_code" value="<?php echo $order_result[1]?>" /></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td width="18%" height="30" align="center" bgcolor="#f3f3f3"><strong>回滚到订单状态：</strong></td>
    <td width="82%" align="left" style="padding:5px">
	<select name="new_order_state_code">
	<?php
		switch($order_result[1]){
			case 500:
			case 600:
				echo '<option value="200">等待财务确认到款[回到尚未处理的状态]</option>';
				echo '<option value="700">完成状态[直接转到确认收到款的状态]</option>';
				break;
			case 700:
				echo '<option value="200">等待财务确认到款[回到尚未处理的状态]</option>';
				echo '<option value="500">等待发货部确认收到退货[直接转到需要退货的状态]</option>';
				break;
		}
	?>
	</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 确 定 " onclick="checkForm()" id="submit_btn" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}

function count_sell_term(){
	check_user(49);
	global $db;
	if($_GET["method"]=="post"){

		$is_send_date = $_POST["is_send_date"];
		$where_array = array();
		if($is_send_date){
			$send_begin_date = $_POST["send_begin_date"];
			$send_end_date = $_POST["send_end_date"];
			if(empty($send_end_date))$send_end_date=$send_begin_date;
			array_push($where_array,"dw=".encode(" and send_time>='".$send_begin_date."' and send_time<='".$send_end_date." 23:59:59'"));
		}

		$is_product_id = $_POST["is_product_id"];
		if($is_product_id){
			$product_id = $_POST["product_id"];
			array_push($where_array,"pw=".encode(" and product_id=".$product_id));
		}

		$is_order_channel_id = $_POST["is_order_channel_id"];
		if($is_order_channel_id){
			$order_channel_id = $_POST["order_channel_id"];
			array_push($where_array,"order_channel_id=".encode($order_channel_id));
		}

		$is_organ = $_POST["is_organ"];
		if($is_organ){
			$organ = $_POST["organ"];
			array_push($where_array,"organ_id=".encode($organ));
		}

		$is_region = $_POST['is_region'];
		if($is_region){
			$region = get_region();
			$region_type = array('province','city','district');
			foreach($region[2] as $key => $code){
				if($code)$region_where .= ' and guest_region_'.$region_type[$key].'_code='.$code;
			}
			array_push($where_array,"rw=".encode($region_where));
		}

		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0 && !$is_product_id){
			$db=new db(true);

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

			echo $product_list=implode(',',array_strip($product_array));

		}

		if($product_list){
			array_push($where_array,"pwi=".encode("product_id in (".$product_list.")"));
		}


		$where = implode("&",$where_array);
		header("location:?c=count_sell&".$where);
	}else{
		$db = new db(true);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
function compareDate(beginDate,endDate){
	var beginDateArray = beginDate.split("-");
	beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
	var endDateArray = endDate.split("-");
	endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
	return Date.parse(beginDate)>Date.parse(endDate);
}
function checkForm(){
	with(document.forms[0]){
		if(is_product_id.checked){
			if(product_id.value==""){
				alert("请选择产品！");
				return;
			}
		}
		if(is_send_date.checked){
			if(send_begin_date.value==""){
				alert("请选择发货开始时间！");
				return;
			}
			if(send_end_date.value!=""){
				if(compareDate(send_begin_date.value,send_end_date.value)){
					alert("发货开始时间不能大于结束时间！");
					return;
				}
			}
		}
		if(is_order_channel_id.checked){
			if(order_channel_id.value==""){
				alert("请选择订购渠道！");
				return;
			}
		}
		if(is_organ.checked){
			if(organ.value==""){
				alert("请选择所属机构！");
				return;
			}
		}
		action = "?c=count_sell_term&method=post";
		method = "post";
		submit();
	}
}

	window.onload=function(){

		autoChoose({

			'product_class'		:	'product_id',
			'sheng'				:	'region',
			'shi'				:	'region',
			'xian'				:	'region'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">产品销售统计器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品名称：</strong></td>
    <td width="75%" align="left">
		<script type="text/javascript" src="js/product.php"></script>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_send_date" type="checkbox" onclick="if(!this.checked)this.checked='checked'" value="true" checked="checked" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td align="left"><input name="send_begin_date" type="text" id="send_begin_date" onclick="showCalendar('send_begin_date','%Y-%m-%d',false,false,'send_begin_date')" size="10" readonly="true" value="<?php echo date('Y-m-d')?>" />—<input name="send_end_date" type="text" id="send_end_date" onclick="showCalendar('send_end_date','%Y-%m-%d',false,false,'send_end_date')" size="10" readonly="true"/>
    [单日只选开始时间即可]</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_region" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购地区：</strong></td>
    <td width="75%" align="left"><script src="js/region.php"></script></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_channel_id" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订购渠道：</strong></td>
    <td width="75%" align="left">
		<?php
		$order_channel_result = $db -> query("select id,name from order_channel where is_valid=1 order by order_index");
		?>
		<select name="order_channel_id">
		<option value="">请选择订购渠道</option>
		<?php
			foreach($order_channel_result as $order_channel_item){
		?>
		<option value="<?php echo $order_channel_item[0]?>"><?php echo $order_channel_item[1]?></option>
		<?php
			}
		?>
		</select>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_organ" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="75%" align="left">
		<?php
			organ_select(171);
		?>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 统 计 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
    </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
	}
}

function count_sell(){
	check_user(49);
	function order_array($array){
		$count = count($array);
		for($i=0;$i<$count;$i++){
			for($j=0;$j<$count-1;$j++){
				if(ord($array[$j][2])>ord($array[$j+1][2])){
					$temp = $array[$j];
					$array[$j] = $array[$j+1];
					$array[$j+1] = $temp;
				}
			}
		}
		return $array;
	}
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/cloud.js?v=beta1.1"></script>
<script type="text/javascript">
	this.onload = function(){
		cloud.startup({
			ignoreLastRows : 1
		});
	}
</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">产品销售统计结果</td>
  </tr>
  <tr>
	<td style="padding:10px">
			<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" id="data_table">
			  <tr bgcolor="#f3f3f3">
				<td width="10%" height="30" align="center"><strong>序列</strong><span lang="int"></span></td>
				<td width="28%" align="center"><strong>产品或产品组</strong><span lang="inner_char"></span></td>
				<td width="23%" align="center"><strong>销售疗程</strong><span lang="int"></span></td>
				<td width="23%" align="center"><strong>销售金额</strong><span lang="float"></span></td>
				<td width="16%" align="center"><strong>订单数量</strong><span lang="float"></span></td>
			  </tr>
			<?php

				$product_where = $_GET['pw'];
				$product_in_where=$_GET['pwi'];
				$date_where = $_GET['dw'];
				$region_where = $_GET['rw'];
				$organ_id = $_GET['organ_id'];
				$order_channel_id = $_GET['order_channel_id'];

				/*
					缓存说明：
					为了减轻服务器压力，选择数据缓存
					为了达到数据时时性，该缓存在有新订单被处理发货之后便自动清除，然后在重新统计之后生成新的缓存
				*/

				$organ_id = encode($organ_id,false);
				$order_channel_id = encode($order_channel_id,false);

				//如果存在机构条件，设置选择的机构做为筛选条件
				if(!empty($organ_id)){
					$organ_where = ' and organ_id='.$organ_id;
				//否则以所拥有的机构作为筛选条件
				}else{
					$organ_where = get_check_organ_sql(171,'organ_id');
				}

				//如果存在订购渠道条件，就加上
				if(is_numeric($order_channel_id)){
					$channel_where = ' and order_channel_id='.$order_channel_id;
				}

				//存在团队产品
				if($product_in_where){
					$product_in_where=" and ".encode($product_in_where,false);
				}

				//如果存在机构条件,才进行数据处理
				if(!empty($organ_where)){

					//先判断缓存是否可用
					//缓存文件路径
					$cache_data_dir_path = 'data/cache/product_sell_data';
					$cache_data_file_path = $cache_data_dir_path.'/'.$product_where.$product_in_where.$date_where.$region_where.encode($organ_where).encode($channel_where).'.php';
					//检测文件目录
					check_dir($cache_data_dir_path);

					$n = $_SESSION['name_switch']?true:false;
					$n = $_GET['n']?true:false;
					$no_cache = $n;

					//$no_cache =1;


					//如果缓存不存在,则读取数据并生成缓存
					if(!file_exists($cache_data_file_path) || $no_cache){
						$db = new db(true);
						//先查询出符合条件的订单
						$order_result = $db->query(
							'select id,product_package_count,order_money from orderform where is_valid=1 and is_sent=1'.encode($date_where,false).encode($region_where,false).$product_in_where.$organ_where.$channel_where,'row'
						);

						//遍历所有订单,查询出产品数据结果
						/*
							$data_result = array(
								0 => array(
										0 => 产品ID,
										1 => 产品名称,
										2 => 产品首字母,
										3 => 产品顶级分类ID,
										4 => 产品分类ID,
										5 => 产品分类名称,
										6 => 产品分类首字母,
										7 => 订单疗程数量,
										8 => 订单金额,
										9 => 订单ID
								),
								...
							)

						*/
						$data_result = array();
						foreach($order_result as $order){
							//获取订单第一条产品记录

							$product_id = $db->query('select product_id from gift where order_id='.$order[0].encode($product_where,false).' order by gift_type desc,id asc limit 1',true,true);
							if(empty($product_id))continue;
							$single_data_result = $db->query('select p.id,p.'.($n?'cn_':'').'name,p.order_letter,c.parent,c.id,c.'.($n?'cn_':'').'name,c.order_letter,'.$order[1].','.$order[2].','.$order[0].' from product as p inner join product_class as c on c.id=p.class_id where p.id='.$product_id.' limit 1',true,'row');
							if(count($single_data_result))$data_result[] = $single_data_result;
						}



						//2014.7.19添加统计订单数量


						//定义产品数据数组
						/*
							$product = array(
								0 => 组产品数组
								1 => 单品数组
							);
						*/
						$product = array_fill(0,2,array());
						//遍历所有获取到的分散数据,对数据按产品做合并处理
						foreach($data_result as $key => $row){
							//根据产品的分类的父类是否为0作为判断依据,0为单品,1为组产品,来设置要取数据的索引
							/*
								$index = array(
									0 => 产品数据数组$product的索引
									1 => 数据的索引,其实就是如果是组产品就取产品分类ID,如果是单品就取产品ID
								);
							*/
							$index = $row[3]>0?array(0,4):array(1,0);

							//如果产品数据数组中没有该产品数据
							$data = empty($product[$index[0]][$row[$index[1]]][0])?
							//那么返回一个比较全面的产品信息数组
							/*
								array(
									循环设置数据的基数0,
									array(
										0 => 产品或分类ID,
										1 => 产品或分类名称,
										2 => 产品或分类首字母,
										3 => 订单疗程数,
										4 => 订单金额,
										5 => 订单数量,
										6 => 对应产品数据数组$product组产品或单品的索引(0或1),
									)
								);
							*/
							array(0,array($row[$index[1]],$row[$index[1]+1],$row[$index[1]+2],$row[7],$row[8],1,$index[0])):
							//否则只返回累加后的疗程数和金额就可以了
							/*
								array(
									循环设置数据的基数3,循环次数是下面的数组的个数,
									array(
										0 => 累加后的订单疗程数,
										1 => 累加后的订单金额
										2 => 累加后的订单数量
									)
								);
							*/
							array(3,array($product[$index[0]][$row[$index[1]]][3]+$row[7],$product[$index[0]][$row[$index[1]]][4]+$row[8],$product[$index[0]][$row[$index[1]]][5]+1));

							//根据设定参数循环设置数据
							for($i=$data[0];$i<count($data[1])+$data[0];$i++)
							$product[$index[0]][$row[$index[1]]][$i] = $data[1][$i-$data[0]];

						}
						//将单品和组产品数据合并到一个数组中,并根据首字母排序
						$product = order_array(array_merge($product[0],$product[1]));
						//写入缓存文件
						if(!$no_cache)file_put_contents($cache_data_file_path,'<?php'."\r\nreturn ".var_export($product,true)."\r\n".'?'.'>');
					//如果存在缓存则使用缓存
					}else{
						$product = include $cache_data_file_path;
					}
				//否则如果没有机构条件，则统计结果为空
				}else{
					$product = array();
				}

				$package_count = 0;
				$money_count = 0;
				$i = 0;
				foreach($product as $item){
					$package_count += $item[3];
					$money_count += $item[4];
					$order_count += $item[5];
			?>
			  <tr bgcolor="#ffffff">
				<td height="30" align="center"><?php echo ++$i?></td>
				<td align="center"><a href="product.php?<?php echo ($item[6]?"c=amply&product_id=":"class_id=").$item[0]?>"><?php echo $item[2]."）".($n?name_decode($item[1]):$item[1])?></a></td>
				<td align="center"><?php echo $item[3]?></td>
				<td align="center"><?php echo round($item[4],1)?></td>
				<td align="center"><?php echo $item[5]?></td>
			  </tr>
			<?php
				}
			?>
			  <tr bgcolor="#ffffff">
				<td height="50" colspan="5" align="center" style="line-height:30px">
					<?php echo "产品种类：".$i."　　销售总疗程：".$package_count."　　销售总金额：".$money_count."　　订单数量：".$order_count?>
				</td>
			  </tr>
			</table>
	</td>
  </tr>
</table>
<?php
}

function order_count_term(){
	check_user(50);
	$db = new db(true);
	if($_GET["method"]=="post"){
		$is_waiter = $_POST["is_waiter"];
		$is_order_type = $_POST["is_order_type"];
		$is_send_date = $_POST["is_send_date"];
		$where_array = array();
		//如果选定了客服,按选定的
		if($is_waiter){
			$waiter = $_POST["waiter"];
			array_push($where_array,"addition_id=".$waiter);
		//如果没有根据自身权限设置
		}else{
			/*
			//获取客服列表
			$waiter_result = array_strip($db->query('select id from user'.get_check_organ_sql(167,NULL,'where')));
			if(count($waiter_result)){
				array_push($where_array,'addition_id in('.implode(',',$waiter_result).')');
			}else{
				check_user(0);
			}
			*/
		}
		if($is_order_type){
			$order_type = $_POST["order_type"];
			array_push($where_array,"order_type_code=".$order_type);
		}
		if($is_send_date){
			$send_begin_date = $_POST["send_begin_date"];
			$send_end_date = $_POST["send_end_date"];
			array_push($where_array,"send_time>='".$send_begin_date."'");
			array_push($where_array,"send_time<='".$send_end_date." 23:59:59'");
		}

		if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

			$user_team_id_array=array_strip($_SESSION['user_team']);
			$user_team_id_str=implode(',',$user_team_id_array);

			$product_array=$db->query("select pid from team_product where tid in(".$user_team_id_str.") and is_valid=1");

			$product_list=implode(',',array_strip($product_array));

		}

		if($product_list){
			array_push($where_array,"product_id in (".$product_list.")");
		}



		$where = implode(" and ",$where_array);
		order_count($where);
	}else{

?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
function compareDate(beginDate,endDate){
	var beginDateArray = beginDate.split("-");
	beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
	var endDateArray = endDate.split("-");
	endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
	return Date.parse(beginDate)>Date.parse(endDate);
}
function checkForm(){
	with(document.forms[0]){
		if(is_waiter.checked){
			if(waiter.value==""){
				alert("请选择客服人员！");
				return;
			}
		}
		if(is_send_date.checked){
			if(send_begin_date.value==""){
				alert("请选择发货开始时间！");
				return;
			}
			if(send_end_date.value==""){
				alert("请选择发货结束时间！");
				return;
			}
			if(compareDate(send_begin_date.value,send_end_date.value)){
				alert("发货开始时间不能大于结束时间！");
				return;
			}
		}
		action = "?c=order_count_term&method=post";
		method = "post";
		submit();
	}
}

	window.onload=autoChoose;

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">发货订单统计器</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_waiter" value="true" id="is_waiter" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>客服人员：</strong></td>
    <td width="75%" align="left">
	<select name="waiter" id="waiter">
	<option value="">请选择客服人员</option>
	<?php
			//如果没有显示所有客服的权限,并且当前用户是客服身份,那么默认只显示自己的
			if(!check_function(179)&&$_SESSION['group_id']==1){
				$result = array(
					array($_SESSION['user_id'],$_SESSION['user_name'],1,$_SESSION['organ_name'])
				);
				$script = '
					<script type="text/javascript">
						$(\'is_waiter\').onclick=function(){
							if(!this.checked)this.checked=true;
						}
						$(\'is_waiter\').click();
						$(\'waiter\').selectedIndex=1;
					</script>
				';
			//否则有权限或者不是客服,将显示该用户所具有的机构权限下的所有客服人员
			}else{
				if(is_array($_SESSION['user_team']) && count($_SESSION['user_team'])>0){

					$user_team_id_array=array_strip($_SESSION['user_team']);
					$user_team_id_str=implode(',',$user_team_id_array);

					$user_array=$db->query("select uid from team_user where tid in(".$user_team_id_str.") and is_valid=1");

					$user_list=implode(',',array_strip($user_array));

				}

				if($user_list){
					$where_user=" and user.id in (".$user_list.")";
				}
				$sql = 'select user.id,user.name,user.enable,organ.name from user inner join organ on organ.id=user.organ_id where user.is_valid=1'.get_check_organ_sql(167).' and user.group_id=1'.$where_user.' order by enable desc,organ.id,user.name';
				//获取客服列表
				$result = $db -> query($sql);
				if(!count($result)){
				$script = '
					<script type="text/javascript">
						$(\'is_waiter\').onclick=function(){
							if(!this.checked)this.checked=true;
						}
					</script>
				';
				}
			}

		foreach($result as $key => $row){
			echo "<option value=\"".$row[0]."\"";
			if(!$row[2])echo ' style="color:#ccc"';
			echo ">".$row[1]." [" . $row[3] . "]</option>\n";
		}
	?>
	</select>
    </td>
  </tr>
  <?php echo $script?>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_type" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单类型：</strong></td>
    <td width="75%" align="left"><label><input type="radio" name="order_type" value="0" />货到付款</label>　<label><input name="order_type" type="radio" value="1" checked="checked" />款到发货</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input name="is_send_date" type="checkbox" value="true" checked="checked" onclick="if(!this.checked)this.checked='checked'" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td align="left"><input name="send_begin_date" type="text" id="send_begin_date" onclick="showCalendar('send_begin_date','%Y-%m-%d',false,false,'send_begin_date')" size="10" readonly="true"/>—<input name="send_end_date" type="text" id="send_end_date" onclick="showCalendar('send_end_date','%Y-%m-%d',false,false,'send_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 统 计 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
  </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
	}
}

function order_count($where=""){
	check_user(50);
?>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">发货订单统计结果</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
		<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc">
		  <tr bgcolor="#f3f3f3">
			<td width="10%" height="30" align="center"><strong>序列</strong></td>
			<td width="15%" align="center"><strong>订单编号</strong></td>
			<td width="17%" align="center"><strong>产品名称</strong></td>
			<td width="14%" align="center"><strong>疗程数量</strong></td>
			<td width="8%" align="center"><strong>订单金额<br/><span style="color:#ccc">(<span style="color:#0099FF">订金</span>+<span style="color:red">代收款</span>)</span></strong></td>
			<td width="16%" align="center"><strong>支付方式</strong></td>
		    <td width="14%" align="center"><strong>收款银行</strong></td>
		  </tr>
		<?php
			$db = new db(true);
			$sql = "select id,order_code,product_package_count,order_money,order_type_name,money_bank_name,reserve_money,pay_money,order_type_code from orderform where is_valid=1 and is_sent=1";
			if($where!="")$sql .= " and ".$where;
			$sql .= get_check_organ_sql(171);
			$sql .= " order by id";

			//exit($sql);

			$result = $db -> query($sql);
			$order_count = count($result);
			$package_count = 0;
			$money_count = 0;
			foreach($result as $key => $item){
				$package_count += $item[2];
				$money_count += $item[3];
		?>
		  <tr bgcolor="#ffffff">
			<td height="30" align="center"><?php echo ++$key?></td>
			<td align="center"><a href="?c=amply&order_id=<?php echo $item[0]?>"><?php echo $item[1]?></a></td>
			<td align="center">
			<?php
				$gift_list = $db -> query("select product_id,product_name from gift where gift_type=1 and order_id=".$item[0]);
				foreach($gift_list as $gift){
			?>
			<div style="line-height:20px"><a href="product.php?c=amply&product_id=<?php echo $gift[0]?>"><?php echo $gift[1]?></a></div>
			<?php
				}
			?>
			</td>
			<td align="center"><?php echo $item[2]?></td>
            <td align="center"><?php if($item[8] == 0){echo  (round($item[3],1).'<span style="color:#ccc">(<span style="color:#0099FF">'.(round($item[6],1).'</span>+<span style="color:red">'.(round($item[7],1) ? round($item[7],1) : round($item[3],1))).'</span>)</span>');}else{echo round($item[3],1);}?></td>
			<td align="center"><?php echo $item[4]?></td>
		    <td align="center"><?php echo $item[5]?></td>
		  </tr>
		<?php
			}
		?>
		  <tr bgcolor="#ffffff">
			<td height="50" colspan="7" align="center" style="line-height:30px">
				<?php echo "订单总数：".$order_count."　　疗程总数：".$package_count."　　销售总金额：".$money_count?>
			</td>
		  </tr>
		</table>
	</td>
  </tr>
</table>
<?php
}

function fact_sign_product(){
	check_user(67);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
function compareDate(beginDate,endDate){
	var beginDateArray = beginDate.split("-");
	beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
	var endDateArray = endDate.split("-");
	endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
	return Date.parse(beginDate)>Date.parse(endDate);
}
function checkForm(){
	with(document.forms[0]){
		if(is_send_date.checked){
			if(send_begin_date.value==""){
				alert("请选择发货开始时间！");
				return;
			}
			if(send_end_date.value==""){
				alert("请选择发货结束时间！");
				return;
			}
			if(compareDate(send_begin_date.value,send_end_date.value)){
				alert("发货开始时间不能大于结束时间！");
				return;
			}
		}
		if(is_money_date.checked){
			if(money_begin_date.value==""){
				alert("请选择收款开始时间！");
				return;
			}
			if(money_end_date.value==""){
				alert("请选择收款结束时间！");
				return;
			}
			if(compareDate(money_begin_date.value,money_end_date.value)){
				alert("收款开始时间不能大于结束时间！");
				return;
			}
		}
		if(is_return_date.checked){
			if(return_begin_date.value==""){
				alert("请选择退货开始时间！");
				return;
			}
			if(return_end_date.value==""){
				alert("请选择退货结束时间！");
				return;
			}
			if(compareDate(return_begin_date.value,return_end_date.value)){
				alert("退货开始时间不能大于结束时间！");
				return;
			}
		}
		action = "excel.php?c=fact_sign_product";
		method = "post";
		target = "_blank";
		submit();
	}
}

	window.onload=function(){

		autoChoose({

			'product_class'			:	'product',

			'send_begin_date'		:	'send_date',
			'send_end_date'			:	'send_date',

			'money_begin_date'		:	'money_date',
			'money_end_date'		:	'money_date',

			'return_begin_date'		:	'return_date',
			'return_end_date'		:	'return_date'

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">产品销售统计报表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品名称：</strong></td>
    <td width="75%" align="left">
		<script type="text/javascript" src="js/product.php"></script> [允许选择产品组]
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_order_type" value="true" checked="checked" onclick="if(!this.checked)this.checked=true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>订单状态：</strong></td>
    <td width="75%" align="left">
	<select name="order_type">
		<option value="0">已完成的订单</option>
		<option value="1">已退货的订单</option>
		<option value="2">未完成的订单</option>
		<option value="3">所有已发货的订单</option>
    </select></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td align="left"><input name="send_begin_date" type="text" id="send_begin_date" onclick="showCalendar('send_begin_date','%Y-%m-%d',false,false,'send_begin_date')" size="10" readonly="true"/>—<input name="send_end_date" type="text" id="send_end_date" onclick="showCalendar('send_end_date','%Y-%m-%d',false,false,'send_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_money_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>收款时间：</strong></td>
    <td align="left"><input name="money_begin_date" type="text" id="money_begin_date" onclick="showCalendar('money_begin_date','%Y-%m-%d',false,false,'money_begin_date')" size="10" readonly="true"/>—<input name="money_end_date" type="text" id="money_end_date" onclick="showCalendar('money_end_date','%Y-%m-%d',false,false,'money_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_return_date" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>退货时间：</strong></td>
    <td align="left"><input name="return_begin_date" type="text" id="return_begin_date" onclick="showCalendar('return_begin_date','%Y-%m-%d',false,false,'return_begin_date')" size="10" readonly="true"/>—<input name="return_end_date" type="text" id="return_end_date" onclick="showCalendar('return_end_date','%Y-%m-%d',false,false,'return_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_organ" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="75%" align="left">
		<?php
			organ_select(171);
		?>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_table_type" value="true" checked="checked" onclick="if(!this.checked)this.checked=true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>报表类型：</strong></td>
    <td align="left">
		<label><input type="radio" value="0" name="table_type" checked="checked" />产品销售报表</label>
    	<label><input type="radio" value="1" name="table_type" />单品报表</label>
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 统 计 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
    </tr>
</table>
</form>
	</td>
  </tr>
</table>
<?php
}
function active_tag_append(){
	check_user(212);
	global $db;
	$db = new db(true);
	if($_GET['method'] == 'post'){
		include_once("include/guide.php");
		$guide = new guide();
		$active_name = $_POST["active_name"];
		if(empty($active_name)){
			$guide -> set_message("对不起，活动名称为空,添加失败！",true);
            $guide -> append("继续添加活动标签","order.php?c=active_tag_append");
		}else{
				$active_url  = $_POST["active_url"];
				$add_time	 = get_time();

				$insert_id=$db->insert('active_tag',array(
					'active_name'   =>   $active_name,
					'active_url'	=>   $active_url,
					'add_time'      =>   strtotime($add_time),
				));

				if($insert_id){
						$guide -> set_message("活动标签添加成功！");
                }else{
                    $guide -> set_message("活动标签添加失败",true);
                    $guide -> set_intro($message);
                    $guide -> append("返回上一页添加活动标签","order.php?c=active_tag_append");
                }
		}
		$guide -> append("查看活动标签列表","order.php?c=active_tag_amply");
		$guide -> out();
	}
?>
	<script type="text/javascript">
		var itemIndex = 0;
		function checkForm(){
			with(document.forms[0]){
				if(active_name.value==""){
					alert("活动名称不能为空！");
					active_name.focus();
					return;
				}
				if(active_url.value==""){
					alert("活动URL不能为空！");
					active_url.focus();
					return;
				}
				action = "?c=active_tag_append&method=post";
                method = "post";
                submit();
			}
		}
	</script>
	<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
      <tr>
        <td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">添加活动标签</td>
      </tr>
      <tr>
        <td style="padding:10px">
            <form>
            <table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
              <tr bgcolor="#ffffff">
                <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>活动名称：</strong></td>
                <td width="84%" align="left"><input type="text" name="active_name" value="" /></td>
              </tr>
               <tr bgcolor="#ffffff">
                <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>活动URL：</strong></td>
                <td width="84%" align="left"><input type="text" name="active_url" value="" /></td>
              </tr>
               <tr bgcolor="#ffffff">
                    <td height="50" colspan="2" align="center">
                        <input type="button" value=" 添 加 " onclick="checkForm()" id="append_button" style="width:90px;height:35px;margin-right:40px" />
                        <input type="reset" value=" 清 除 " style="width:90px;height:35px" />
                    </td>
               </tr>
            </table>
            </form>
        </td>
      <tr>
    </table>


<?php
}
function active_tag_amply(){
	check_user(213);

	$db=new db(true);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript">
function remove(url){
    <?php
    //如果有删除权限
    if(check_function(47)){
    ?>
   	   if(window.confirm('确定要删除这些订单吗？')){
            command(url);
        }
    <?php
    }else{
    ?>
    alert('<?php echo get_alert_message(47)?>');
    <?php
    }
    ?>
}

</script>
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">客服订单列表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="list_table">
      <tr bgcolor="#f3f3f3">
        <td width="3%" height="30" align="center"><strong>序列</strong></td>
        <td width="7%" align="center"><strong>活动名称</strong></td>
        <td width="10%" align="center"><strong>活动图片</strong></td>
        <td width="10%" align="center"><strong>添加时间</strong></td>
        <td width="4%" align="center"><strong>选择</strong></td>
      </tr>
<?php
	include_once("include/page.php");
	$sql = "select id,active_name,active_url,add_time,is_valid from active_tag where is_valid=1 order by id desc";
	$result = $db -> query($sql);
	$i=1;
	foreach($result as $key => $row){
?>
      <tr bgcolor="#ffffff"<?php if($row['is_valid']==0)echo " class=\"deleted\""?>>
        <td align="center"><?php echo  $i ?></td>
        <td align="center" height="30"><?php echo $row['active_name'] ?></td>
        <td align="center" height="30"><img src="<?php echo $row['active_url'] ?>" width="150" height="30" /></td>
        <td align="center" height="30"><?php echo date('Y-m-d H:i:s',$row['add_time']) ?></td>
        <td align="center"><input type="checkbox" name="ChooseCheck[]" value="<?php echo $row['id']?>" onclick="if(!this.checked)this.parentNode.parentNode.style.background='#fff'"<?php if($row['is_valid']==0)echo' disabled="disabled"'?> /></td>
      </tr>
<?php
	$i++;
	}
?>
	 <tr bgcolor="#ffffff">
        <td height="50" colspan="14" align="center">
            <input name="button" type="button" onclick="command('?c=active_tag_amend')" value=" 修 改 " />　
            <input name="button" type="button" onclick="window.remove('?c=active_tag_remove')" value=" 删 除 " />　
            <input name="button" type="button" onclick="selectCheck('reverse')" value=" 反 选 " />　
            <input name="button" type="button" onclick="selectCheck('all')" value=" 全 选 " />
         </td>
   	 </tr>
	</table>
   </td>
  </tr>
</table>
	</form>
<?php
}
function active_tag_amend(){
	check_user(214);
	global $db;
	$db = new db(true);

	$active_id = $_GET["active_id"];

	if(!isset($active_id))$active_id=get_selected(false,1);

	$active_tag=$db->query('select * from active_tag where id='.$active_id,true);
	if(!$active_tag['is_valid']){
        $guide -> set_message("已删除的活动标签不允许修改！",true);
        $guide -> append("活动标签列表","?".get_common_param());
        $guide -> out();
    }

	if($_GET['method'] == 'post'){
		include_once("include/guide.php");
		$guide = new guide();
		$active_name = $_POST["active_name"];
		if(empty($active_name)){
			$guide -> set_message("对不起，活动名称为空,添加失败！",true);
            $guide -> append("继续添加活动标签","order.php?c=active_tag_append");
		}else{
				$active_url  = $_POST["active_url"];
				$add_time	 = get_time();

				$update_id=$db->update('active_tag',array(
					'active_name'   =>   $active_name,
					'active_url'	=>   $active_url,
					'add_time'      =>   strtotime($add_time),
				),$active_id);

				if($update_id){
						$guide -> set_message("活动标签修改成功！");
                }else{
                    $guide -> set_message("活动标签修改失败",true);
                    $guide -> set_intro($message);
                    $guide -> append("返回上一页添加活动标签","order.php?c=active_tag_append");
                }
		}
		$guide -> append("查看活动标签列表","order.php?c=active_tag_amply");
		$guide -> out();
	}

?>
	<script type="text/javascript">
		var itemIndex = 0;
		function checkForm(){
			with(document.forms[0]){
				if(active_name.value==""){
					alert("活动名称不能为空！");
					active_name.focus();
					return;
				}
				if(active_url.value==""){
					alert("活动URL不能为空！");
					active_url.focus();
					return;
				}
				action = "?c=active_tag_amend&method=post&active_id=<?php echo $active_id; ?>";
                method = "post";
                submit();
			}
		}
	</script>
	<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
      <tr>
        <td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">添加活动标签</td>
      </tr>
      <tr>
        <td style="padding:10px">
            <form>
            <table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
              <tr bgcolor="#ffffff">
                <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>活动名称：</strong></td>
                <td width="84%" align="left"><input type="text" name="active_name" value="<?php echo  $active_tag['active_name']  ?>" /></td>
              </tr>
               <tr bgcolor="#ffffff">
                <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>活动URL：</strong></td>
                <td width="84%" align="left"><input type="text" name="active_url" value="<?php echo  $active_tag['active_url']  ?>" /></td>
              </tr>
               <tr bgcolor="#ffffff">
                    <td height="50" colspan="2" align="center">
                        <input type="button" value=" 修 改 " onclick="checkForm()" id="append_button" style="width:90px;height:35px;margin-right:40px" />
                        <input type="reset" value=" 清 除 " style="width:90px;height:35px" />
                    </td>
               </tr>
            </table>
            </form>
        </td>
      <tr>
    </table>

<?php
}

function active_tag_remove(){
	check_user(215);
	$db = new db(true);
	$time = get_time();
	$active_id_array = get_selected(true);

	if(!count($active_id_array)){
        $active_id_array[] = $_GET["active_id"];
	}

	$active_id_string = implode(',',$active_id_array);

	$db->execute("update active_tag set is_valid=0 where id in(".$active_id_string.")");

	include("include/guide.php");

	$guide = new guide();

	$guide -> set_message("订单删除完成！");

	$guide -> out();


}


function import(){
	check_user(226);
	global $db;
	$db = new db(true);

	if($_GET['method'] == 'post'){
        $csvfiles = $_FILES["csvfile"];

        $result = array();
        $field = array();
        $success = array();
        $fail = array();

        foreach((array)$csvfiles["tmp_name"] as $key => $file_tmp_name){

            if(empty($file_tmp_name) || !file_exists($file_tmp_name))continue;

            $csv_result = array();
            $file = fopen($file_tmp_name,"r");
            while(!feof($file))$csv_result[] = fgetcsv($file);
            fclose($file);

            if(count($csv_result)>0){

                $field = $csv_result[0];

                //头条鲁班
                if($_POST['source']==1){
                    //订单编号,商品名称（套餐.规格）,商品编号,商品编码,数量,货款,运费,支付方式,收件人,收件人手机号,收货地址,省,市,区,详细地址,用户留言,商家留言,订单提交时间,完成时间,快递公司,快递单号,订单状态,支付类型

                    for($i=1;$i<count($csv_result);$i++){
                        if(is_array($csv_result[$i])){
                            $row =  $csv_result[$i];
                            $file_node = 1;
                            $row[0] = str_replace('\'','',$row[0]);
                            $row[2] = str_replace('\'','',$row[2]);
                            $row[10] = str_replace(' ','',$row[10]);
                            if(strpos($row[11],'省') || strpos($row[11],'市'))$row[11].='省';
                            if(strpos($row[12],'市'))$row[11].='市';
                            $row[20] = str_replace('\'','',$row[20]);

                            /*
                                编号，客户编号同订单编号
                            */
                            $sn = $row[0];

                            /*
                                产品信息，订购信息
                            */
                            //如果是古因
                            if(strpos($row[1],'古因')!==FALSE){
                                $product_id = 12;//产品ID
                                $product_name = 'G02';//产品名称
                                preg_match('/\D+(\d+)g.+/i',$row[1],$match_result);
                                $unit_weight = 260;
                                $weight = $match_result[1];//产品重量
                                $product_count = ceil($weight/$unit_weight);//产品数量
                                $product_money = $row[5];//产品金额
                            }elseif(strpos($row[1],'眼部新视界')!==FALSE){
                                $product_id = 6;//产品ID
                                $product_name = 'Y01';//产品名称
                                preg_match('/\D+(\d+)盒.+/i',$row[1],$match_result);
                                $product_count = $match_result[1];//产品数量
                                $product_money = $row[5];//产品金额
                            }else{
                                $row['status'] = 0;
                                $result[] = $row;
                                $fail[$i] = '未找到匹配产品';
                                continue;
                            }

                            /*
                                客户信息
                            */
                            $name = $row[8];//姓名
                            $phone = $row[9];//电话

                            $procince = $db->query('SELECT Diqu_Code FROM region WHERE Diqu_Level=11 AND Diqu_QuanCheng=\''.$row[11].'\'',true,true);//省代号
                            $city = $db->query('SELECT Diqu_Code FROM region WHERE Diqu_Level=12 AND Diqu_QuanCheng=\''.$row[12].'\'',true,true);//市代号
                            $district = $db->query('SELECT Diqu_Code FROM region WHERE Diqu_Level IN(13,16) AND Diqu_QuanCheng=\''.$row[13].'\'',true,true);//区县代号
                            $region_code = implode(',',array($procince,$city,$district));//地区全代号
                            $region_name = implode(',',array($row[11],$row[12],$row[13]));//地区全名称
                            $address = $row[10];//收货地址

                            /*
                                操作人信息
                            */
                            $user_id = $_SESSION['user_id'];
                            $user_name = $_SESSION['user_name'];

                            //当前时间，日期
                            $time = get_time();
                            $date = date('Y-m-d');

                            //下单时间
                            $add_time = $row[17];

                            //机构ID
                            $organ_id = 1;

                            //来源
                            $resource = 1;//头条鲁班

                            //判断订单编号是否存在，不存在则写入，存在则略过
                            if($db->query('SELECT COUNT(id) FROM orderform WHERE order_code=\''.$sn.'\'',true,true)){
                                $row['status'] = 0;
                                $result[] = $row;
                                $fail[$i] = '订单已存在';
                                continue;
                            }

                            /*
                                客户数据
                            */
                            $guest_data = array();
                            $guest_data['customer_number'] = $sn;//客户编号
                            $guest_data['name'] = $name;//客户姓名
                            $guest_data['diqu_code'] = $region_code;//地区编号
                            $guest_data['diqu_name'] = $region_name;//地区名称
                            $guest_data['guest_region_province_code'] = $procince;//省
                            $guest_data['guest_region_city_code'] = $city;//市
                            $guest_data['guest_region_district_code'] = $district;//区
                            $guest_data['address'] = $address;//收货地址
                            $guest_data['id_addPerson'] = $user_id;//添加人ID
                            $guest_data['name_addPerson'] = $user_name;//添加人姓名
                            $guest_data['time_add'] = $time;//添加时间
                            $guest_data['time_LastDo'] = $time;//最后操作时间
                            $guest_data['organ_id'] = $organ_id;//机构ID
                            $guest_data['last_order_time'] = $add_time;//最后下单时间
                            $guest_data['resource'] = 1;//来源，头条鲁班导入
                            $guest_data['intro'] = '[头条鲁班]'.implode(',',$row);//备注
                            $guest_id = $db->insert('customer',$guest_data);//写入客户数据，得到客户ID

                            $guest_contact_data = array();
                            $guest_contact_data['type'] = '手机';//联系方式类型
                            $guest_contact_data['content'] = $phone;//联系方式内容
                            $guest_contact_data['id_Customer'] = $guest_id;//客户ID
                            $guest_contact_data['name_Customer'] = $name;//客户姓名
                            $guest_contact_data['time_Add'] = $time;//添加时间
                            $db->insert('customercontact',$guest_contact_data);//写入联系方式数据

                            /*
                                订单数据
                            */
                            $order_data = array();
                            $order_data['order_code'] = $sn;//订单编号
                            $order_data['product_id'] = $product_id;//产品ID
                            $order_data['product_name'] = $product_name;//产品名称
                            $order_data['product_package_count'] = 1;//产品周期数
                            $order_data['product_package_price'] = $product_money;//产品周期价格
                            $order_data['product_unit_count'] = $product_count;//产品数量
                            $order_data['order_money'] = $product_money;//订单金额
                            if($row[7]=='在线支付'){//如果是款到发货
                                $order_data['pay_money'] = 0;//代收金额
                                $order_data['reserve_money'] = $product_money;//已付金额
                            }else{
                                $order_data['pay_money'] = $product_money;//代收金额
                                $order_data['reserve_money'] = 0;//已付金额
                            }

                            $order_data['guest_id'] = $guest_id;//客户ID
                            $order_data['guest_name'] = $name;//客户姓名
                            $order_data['guest_region_code'] = $region_code;//地区编号
                            $order_data['guest_region_name'] = $region_name;//地区名称
                            $order_data['guest_region_province_code'] = $procince;//省
                            $order_data['guest_region_city_code'] = $city;//市
                            $order_data['guest_region_district_code'] = $district;//区
                            $order_data['guest_address'] = $address;//收货地址
                            $order_data['guest_contact'] = '手机：'.$phone;//联系方式

                            $order_data['order_channel_id'] = 21;//渠道ID
                            $order_data['order_channel_name'] = '头条下单';//渠道名称
                            $order_data['addition_id'] = $user_id;//添加人ID
                            $order_data['addition_name'] = $user_name;//添加人姓名
                            $order_data['add_time'] = $time;//添加时间
                            $order_data['resources_add_day'] = strtotime($date);//资源日期

                            //订单类型
                            if($row[7]=='在线支付'){//如果是款到发货
                                $order_data['order_type_code'] = 1;//订单类型
                                $order_data['order_type_name'] = '款到发货';//类型名
                            }else{
                                $order_data['order_type_code'] = 0;
                                $order_data['order_type_name'] = '货到付款';
                            }

                            //订单状态
                             if($row[21]=='待支付订金'){
                                $order_data['order_state_code'] = 150;//订单状态
                                $order_data['order_state_name'] = '等待财务部确认收到订金';//订单状态名
                            }elseif(!$row[21]||$row[21]=='备货中'){//如果是未发货
                                $order_data['order_state_code'] = 300;//订单状态
                                $order_data['order_state_name'] = '等待发货部处理发货';//订单状态名
                            }elseif($row[21]=='已发货'){//如果是已发货
                                if($row[7]=='在线支付'){//如果是款到发货
                                    $order_data['order_state_code'] = 700;
                                    $order_data['order_state_name'] = '已完成';
                                }else{//如果是货到付款
                                    $order_data['order_state_code'] = 200;
                                    $order_data['order_state_name'] = '等待财务部确认到款';
                                }
                                $order_data['is_sent'] = 1;//已发货
                            }elseif($row[21]=='已取消'){//如果是已取消，设置成未发货，已删除
                                $order_data['order_state_code'] = 300;//订单状态
                                $order_data['order_state_name'] = '等待发货部处理发货';//订单状态名
                                $order_data['delete_person_id']=$user_id;
                                $order_data['delete_person_name']=$user_name;
                                $order_data['delete_time']=$time;
                                $order_data['is_valid']=0;
                            }elseif($row[21]=='已完成'){//如果是已完成，发货系统也是已完成
                                $order_data['order_state_code'] = 700;
                                $order_data['order_state_name'] = '已完成';
                                $order_data['is_sent'] = 1;
                                $order_data['is_finished'] = 1;
                                if($row[18])$order_data['finished_time'] = $row[18];
                            }

                            //到款
                            if($row[7]=='在线支付'){
                                $order_data['bank_money_time']=$add_time;//到款时间为客户下单时间
                                $order_data['money_bank_name']='其他银行';//到款银行
                                $order_data['money_bank_code']='其他帐号';//到款帐户
                                $order_data['money_fact_time']=$add_time;//到款时间为客户下单时间
                                $order_data['money_fact_count']=$product_money;//到款金额
                            }

                            //快递公司
                            if($row[19]){
                                if(strpos($row[19],'圆通')!==FALSE){
                                    $order_data['express_id']=2;//快递ID
                                    $order_data['express_name']='圆通';//快递名称
                                }elseif(strpos($row[19],'顺丰')!==FALSE){
                                    $order_data['express_id']=1;
                                    $order_data['express_name']='山东顺丰';
                                }elseif(strpos($row[19],'京东')!==FALSE){
                                    $order_data['express_id']=8;
                                    $order_data['express_name']='京东快递';
                                }
                                $order_data['express_order_code']=$row[20];//快递单号
                            }

                            $order_data['order_intro']='[头条鲁班]'.implode(',',$row);//备注
                            $order_data['organ_id']=$organ_id;//机构ID
                            $order_data['resource']=1;//来源
                            $order_id = $db->insert('orderform',$order_data);//写入订单数据，得到订单ID

                            //订单产品
                            $order_product_data = array();
                            $order_product_data['order_id']=$order_id;//订单ID
                            $order_product_data['product_id']=$product_id;//产品ID
                            $order_product_data['product_name']=$product_name;//订单名称
                            $order_product_data['product_count']=$product_count;//产品数量
                            $order_product_data['gift_money']=$product_money;//产品金额
                            $db->insert('gift',$order_product_data);//写入订单产品数据


                            //print_r($guest_data);
                            //print_r($guest_contact_data);
                            //print_r($order_data);
                            //print_r($order_product_data);
                            //exit;


                            $row['status'] = 1;
                            $result[] = $row;
                            $success[$i]='成功';

                        }
                    }
                }

            }
        }

        unset($row);

        echo '
            <style type="text/css">
            .list_table td{height:30px;word-wrap:break-word;word-break:normal;}
            </style>
            <table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
                <tr>
                    <td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">订单导入结果</td>
                </tr>
                <tr>
                    <td style="padding:10px">
                    <div style="font-weight:bold;font-size:20px;color:#333;background:#f0f0f0;border-radius:10px;padding:5px 10px">导入完毕：本次共上传数据 '.count($result).' 条，<span style="color:#093">成功 '.count($success).' 条</span>，<span style="color:#f00">失败 '.count($fail).' 条</span></div>
                    <div style="overflow:scroll;margin-top:10px" id="result">
        ';

        echo '
        <table width="250%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="list_table">
            <tr bgcolor="#f3f3f3">
                <td>导入状态</td>
        ';
        foreach($field as $name){
            echo '<td>'.$name.'</td>';
        }
        echo '
            </tr>
        ';
        foreach($result as $key => $row){
            echo '<tr bgcolor="#ffffff">';
            if($row['status']){
                echo '<td style="color:#093;font-weight:bold">'.$success[$key+1].'</td>';
            }else{
                echo '<td style="color:#f00;font-weight:bold">'.$fail[$key+1].'</td>';
            }
            unset($row['status']);
            foreach($row as $value){
                echo '<td>'.$value.'</td>';
            }
            echo '</tr>';
        }
        echo '
        </table>
        ';
        echo '
                            </div>
        ';
        echo '
        <script type="text/javascript">
        document.getElementById(\'result\').style.height=(document.documentElement.clientHeight-108)+\'px\';
        </script>
        ';
        echo '
                        <td>
                    </tr>
                </table>
            </body>
            </html>
        ';
        exit;
	}

?>
	<script type="text/javascript">
		var itemIndex = 0;
		function checkForm(btn){
			with(document.forms[0]){
				if(csvfile.value==""){
					alert("请选择CSV文件！");
					active_name.focus();
					return;
				}
                btn.disabled = true;
				action = "?c=import&method=post";
                method = "post";
                submit();
			}
		}
	</script>
	<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
      <tr>
        <td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">导入订单数据</td>
      </tr>
      <tr>
        <td style="padding:10px">
            <form enctype="multipart/form-data">
            <table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
              <tr bgcolor="#ffffff">
                <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>订单来源：</strong></td>
                <td width="84%" align="left">
                    <select name="source">
                        <option value="1">头条鲁班</option>
                    </select>
                </td>
              </tr>
               <tr bgcolor="#ffffff">
                <td width="16%" height="30" align="center" bgcolor="#f3f3f3"><strong>CSV文件：</strong></td>
                <td width="84%" align="left"><input type="file" name="csvfile" /></td>
              </tr>
               <tr bgcolor="#ffffff">
                    <td height="50" colspan="2" align="center">
                        <input type="button" value=" 导 入 " onclick="checkForm(this)" id="append_button" style="width:90px;height:35px;margin-right:40px" />
                    </td>
               </tr>
            </table>
            </form>
        </td>
      <tr>
    </table>

<?php
}


function guest_order_counts(){
	check_user(229);
?>
<script type="text/javascript" src="js/element.js"></script>
<script type="text/javascript" src="js/alert.js"></script>
<script type="text/javascript" src="js/calendar/calendar.js"></script>
<script type="text/javascript">
function compareDate(beginDate,endDate){
	var beginDateArray = beginDate.split("-");
	beginDate = beginDateArray[1]+"/"+beginDateArray[2]+"/"+beginDateArray[0];
	var endDateArray = endDate.split("-");
	endDate = endDateArray[1]+"/"+endDateArray[2]+"/"+endDateArray[0];
	return Date.parse(beginDate)>Date.parse(endDate);
}
function checkForm(){
	with(document.forms[0]){
		if(is_send_date.checked){
			if(send_begin_date.value==""){
				alert("请选择发货开始时间！");
				return;
			}
			if(send_end_date.value==""){
				alert("请选择发货结束时间！");
				return;
			}
			if(compareDate(send_begin_date.value,send_end_date.value)){
				alert("发货开始时间不能大于结束时间！");
				return;
			}
		}
		action = "excel.php?c=guest_order_counts";
		method = "post";
		target = "_blank";
		submit();
	}
}

	window.onload=function(){

		autoChoose({

			'send_begin_date'		:	'send_date',
			'send_end_date'			:	'send_date',

		});

	}

</script>
<table width="100%" border="0" cellpadding="0" cellspacing="1" style="border:1px solid #9EB4C9;margin-bottom:10px">
  <tr>
	<td height="25" bgcolor="#9EB4C9" style="color:#fff;font-weight:bold;text-align:center">客户订购统计报表</td>
  </tr>
  <tr>
	<td align="center" style="padding:10px">
<form>
<table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="#cccccc" class="FormTable">
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_product" value="true" checked="checked" onclick="this.checked=true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>产品名称：</strong></td>
    <td width="75%" align="left">
		<script type="text/javascript" src="js/product.php"></script> [允许选择产品组]
	</td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_send_date" value="true" checked="checked" onclick="this.checked=true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>发货时间：</strong></td>
    <td align="left"><input name="send_begin_date" type="text" id="send_begin_date" onclick="showCalendar('send_begin_date','%Y-%m-%d',false,false,'send_begin_date')" size="10" readonly="true"/>—<input name="send_end_date" type="text" id="send_end_date" onclick="showCalendar('send_end_date','%Y-%m-%d',false,false,'send_end_date')" size="10" readonly="true"/></td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="30" align="center" bgcolor="#f3f3f3"><input type="checkbox" name="is_organ" value="true" /></td>
    <td height="30" align="center" bgcolor="#f3f3f3"><strong>所属机构：</strong></td>
    <td width="75%" align="left">
		<?php
			organ_select(171);
		?>
    </td>
  </tr>
  <tr bgcolor="#ffffff">
    <td height="50" colspan="3" align="center">
		<input type="button" value=" 统 计 " onclick="checkForm()" />　
		<input type="reset" value=" 清 除 " />
	</td>
    </tr>
</table>
</form>
	</td>
  </tr>
</table>

<?php
}
?>




</body>
</html>