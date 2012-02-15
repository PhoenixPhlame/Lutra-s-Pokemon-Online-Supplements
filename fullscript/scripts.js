﻿(load = function() {
	global = this;
	helpers = new Object();
	helpers = { 
		setregvalue: function(regkey, regdata){
			if (sys.getVal(regkey) == ""){
				sys.saveVal(regkey, regdata);
			}
		}
		
		,

		setvariable: function(variable,data){
			if (typeof(global[variable]) == 'undefined'){
				global[variable] = data;
			}
		}
		
		,

		setobjectvariable: function(variable, obj){
			try { 
				global[variable] = JSON.parse(obj);
			}
			catch(error){
				print("Error: " + variable + " is unable to be set due to a JSON parse error.");
			}
		}

		,

		setvariableprocedure: function(variable, procedure){
			if(typeof(global[variable]) == 'undefined'){
				helpers[procedure]();
			}
		}
			
		,
		
		memberslist: function(){
			var membersdatabase = sys.dbAll(), membersindex, playernumber;
			members = new Object();
			for (membersindex in membersdatabase){
				members[membersdatabase[membersindex]] = membersdatabase[membersindex];
				playernumber = sys.id(membersdatabase[membersindex]);
				if (playernumber != undefined){
					members[membersdatabase[membersindex]] = sys.name(playernumber);
				}
			}
		}

		,

		membersadd: function(srcname){
			if (members[srcname] === undefined){
				members[srcname.toLowerCase()] = srcname;
			}
		}

		,

		memberscheck: function(name){
			if (members[name.toLowerCase()] !== undefined){
				return true;
			}
		}

		,

		ipcheck: function(ip){
			if (iplist[ip.toLowerCase()] !== undefined){
				return true;
			}
		}

		,

		ips: function(name){
			var antimemberindex, ipslist = new Array(), ipslistindex = 0;
			for (antimemberindex in antimemberlist){
				if (name.toLowerCase() == antimemberlist[antimemberindex].toLowerCase()){
					ipslist[ipslistindex] = antimemberindex;
					ipslistindex++;
				}
			}
			return ipslist;
		}

		,

		aliascheck: function(name){
			if (aliaslist[name.toLowerCase()] !== undefined){
				return true;
			}
		}

		,

		aliasesips: function(src, srcname, srcip){
			if (JSON.stringify(iplist).length > 50000){
				var ipaliases = Object.keys(iplist), ipaliasesindex;
				if (ipaliases.length < 500){
					iplist = new Object();
					sys.saveVal("Ip_List", "{}");
				}
				for (ipaliasesindex = 0; ipaliasesindex < 500; ipaliasesindex++){
					delete iplist[ipaliases[ipaliasesindex]];
				}
				sys.sendHtmlAll("<timestamp/><b> The server has detected the IP-Aliases list to be too large and has deleted the first 500 entries.</b>", 0);
			} 
			if (iplist[srcip] === undefined){
				iplist[srcip]  = new Array();
			}
			if (iplist[srcip].indexOf(srcname.toLowerCase()) == -1){
				iplist[srcip].push(srcname.toLowerCase());
				sys.saveVal("Ip_List", JSON.stringify(iplist));
			}
			if (JSON.stringify(antimemberlist).length > 50000){
				var iplastalias = Object.keys(antimemberlist), iplastaliasindex;
				for (iplastaliasindex = 0; iplastaliasindex < 500; iplastaliasindex++){
					delete antimemberlist[iplastalias[iplastaliasindex]];
				}
				sys.sendHtmlAll("<timestamp/><b> The server has detected the IP-Last Alias list to be too large and has deleted the first 500 entries.</b>", 0);
			} 
			antimemberlist[srcip] = srcname;
			sys.saveVal("AntiMember_List", JSON.stringify(antimemberlist));
			if (JSON.stringify(aliaslist).length > 50000){
				var aliasips = Object.keys(aliaslist), aliasipsindex;
				if (aliasips.length < 500){
					aliaslist = new Object();
					sys.saveVal("Alias_List", "{}");
				}
				for (aliasipsindex = 0; aliasipsindex < 500; aliasipsindex++){
					delete aliaslist[aliasips[aliasipsindex]];
				}
				sys.sendHtmlAll("<timestamp/><b> The server has detected the Alias-IPs list to be too large and has deleted the first 500 entries.</b>", 0);
			} 		
			if (aliaslist[srcname.toLowerCase()] === undefined){
				aliaslist[srcname.toLowerCase()]  = new Array();
			}
			if (aliaslist[srcname.toLowerCase()].indexOf(srcip) == -1){
				aliaslist[srcname.toLowerCase()].push(srcip);
				sys.saveVal("Alias_List", JSON.stringify(aliaslist));
			}	
		}

		,

		setautharray: function (array, value){
			global[array] = new Array(); var authindex; var authdb = sys.dbAuths();
			for (authindex in authdb){
				if(sys.dbAuth(authdb[authindex]) == value){
					global[array].push(members[authdb[authindex]]);
				}
			}
		}
			
		,
			
		authlistdisplay: function (array, level, color) {
			if (global[array].length > 0){
				var authlistdisplay = '<br/><font color=' + color +  ' size=4>' + global['AuthLevel' + level + 'Name'] + 's:' + '</font>'; var arrayindex;
				for(arrayindex in global[array]){
					authlistdisplay += helpers.connectstatus(global[array][arrayindex]);
				}
				authlistdisplay += "<br/>";
				return authlistdisplay;
			}
			return '';
		}
			
		,

		owneradd: function(src){
			if (sys.ip(src) == "127.0.0.1" && typeof(ownername) === "undefined"){
				ownername = sys.name(src);
				sys.changeAuth(src, 3);
			}
		}

		,

		ownerremove: function(src){
			if (sys.ip(src) == "127.0.0.1" && typeof(ownername) === "string"){
				if (ownername == sys.name(src)){					
					sys.changeDbAuth(ownername, 0);
					delete ownername;
				}
			}
		}

		,

		connectstatus: function (playername){
			var playernumber = sys.id(playername), authimageindex;
			var connectstatus = playernumber == undefined ? " <font color='red'><b><small>Offline</small></b></font> " : " <font color='green'><b><small>Online</small></b></font> ";
			var namecolor = playernumber == undefined ? "none" : helpers.namecolor(playernumber);
			if (sys.battling(playernumber) == true){
				authimageindex = sys.dbAuth(playername) + 8;
			}
			else if (sys.away(playernumber) === false){
				authimageindex = sys.dbAuth(playername);
			}
			else {
				authimageindex = sys.dbAuth(playername) + 4;
			}
			playernumber = playernumber != undefined ? playernumber : "0";
			return "<br/>" + helpers.authimage(authimageindex) + " " + "<b><font color='" + namecolor + "'>" + playername + "</b>" + connectstatus + "<b><small>Session ID: " + playernumber + "</small></b> ";
		}

		,

		authimage: function(authlevel){
			return ({
				11: "<img src='Themes/Classic/client/oBattle.png'>"

				,

				10: "<img src='Themes/Classic/client/aBattle.png'>"

				,

				9: "<img src='Themes/Classic/client/mBattle.png'>"

				,

				8: "<img src='Themes/Classic/client/uBattle.png'>"

				,
				
				7: "<img src='Themes/Classic/client/oAway.png'>"

				,

				6: "<img src='Themes/Classic/client/aAway.png'>"		

				,

				5: "<img src='Themes/Classic/client/mAway.png'>"		

				,

				4: "<img src='Themes/Classic/client/uAway.png'>"	

				,

				3: "<img src='Themes/Classic/client/oAvailable.png'>"		

				,
			
				2: "<img src='Themes/Classic/client/aAvailable.png'>"	

				,

				1: "<img src='Themes/Classic/client/mAvailable.png'>"		

				,

				0: "<img src='Themes/Classic/client/uAvailable.png'>"			
			}[authlevel] || "<img src='Themes/Classic/client/uAway.png'>");	
		}

		,

		converttime : function (time){
			if (time > 86400000){
				return " <b>Days:</b> " + Math.floor(time/86400000) + " <b>Hours:</b> " + Math.floor((time%86400000)/3600000) + " <b>Minutes:</b> " + Math.floor(((time%86400000)%3600000)/60000) + " <b>Seconds:</b> " + Math.floor((((time%86400000)%3600000)%60000)/1000);
			}
			if (time > 3600000){
				return " <b>Hours:</b> " + Math.floor((time%86400000)/3600000) + " <b>Minutes:</b> " + Math.floor(((time%86400000)%3600000)/60000) + " <b>Seconds:</b> " + Math.floor((((time%86400000)%3600000)%60000)/1000);
			}
			if (time > 60000){
				return " <b>Minutes:</b> " + Math.floor(((time%86400000)%3600000)/60000) + " <b>Seconds:</b> " + Math.floor((((time%86400000)%3600000)%60000)/1000);
			}
			return " <b>Seconds:</b> " + Math.floor((((time%86400000)%3600000)%60000)/1000);
		}

		,

		converttoseconds: function (unit, time){
			return({"minutes": time*60 , "minute": time*60, "hours": time*3600, "hour": time*3600, "days": time*86400,"day": time*86400, "weeks": time*604800, "week": time*604800, "months": time*2592000 , "month": time*2592000, "year": time*31536000 , "years": time*31536000}[unit] || time);
		}

		,

		timeplurality: function(time, unit){
			if (time == 1 && unit[unit.length-1] == "s"){
				unit = unit.replace(/s$/, "");
			}
			else if (time != 1 && unit[unit.length-1] != "s"){
				unit = unit + "s";
			}
			return unit;
		}

		,

		nottimeunit: function(unit){
			return unit != "seconds" && unit != "second" && unit != "minutes" && unit != "minute" && unit != "hours" && unit != "hour" && unit != "days" && unit != "day" && unit != "weeks" && unit != "week" && unit != "months" && unit != "month" && unit != "years" && unit != "year";
		}

		,

		removespaces: function(string){
			return string.split(' ').join('');
		}

		,

		escapehtml: function(str) {
			return str.replace(/&/g,'&amp;').replace(/\>/g,'&gt;').replace(/\</g,'&lt;'); 
		}

		,

		configload: function(){
			var config = sys.getFileContent("config").split("\n"), configindex;
			var portregexp = new RegExp("server_port","g"), serverregexp = new RegExp("server_name","g");
			port = "unknown";
			servername = "unknown"; 
			for (configindex in config){
				if (portregexp.test(config[configindex]) == true){
					port = config[configindex].substr(12);
				}
				if (serverregexp.test(config[configindex]) == true){
					servername = config[configindex].substring(12).replace(/\\xe9/g, "é");
				}	
			}
		}

		,

		exportdb: function(datatype, database, src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			sys["export" + database + "Database"]();
			var exportmessage = border + "<br/>"
			+ "<timestamp/> The " + datatype + " data has successfully been exported.<br/>"
			+ border;
			sys.sendHtmlMessage(src, exportmessage, channel);	
		}

		,

		serverscriptdownload: function (){
			sys.webCall(serverscriptlink, "if (/share/gi.test(resp)){sys.saveVal('Script_Options_LutraServerScript', resp)}");
			serverscript = sys.getVal("Script_Options_LutraServerScript");
		}

		,

		autoupdatescriptdownload: function(){
			sys.webCall(autoupdatescriptlink, "if (/webcall/gi.test(resp)){sys.saveVal('Script_Options_LutraAutoUpdateScript', resp)}");
			autoupdatescript = sys.getVal("Script_Options_LutraAutoUpdateScript");
		}

		,

		scriptversion: function(){
			if (scriptcontent == serverscript){
				scriptversion = "<b><font color='blue'>\u2022  The Server is using the up-to-date Full Original Script.</font></b>";
			}
			else if (scriptcontent == autoupdatescript){
				scriptversion = "<b><font color='green'>\u2022  The Server is using the up-to-date Auto-Update Script.</font></b>";
			}
			else if (scriptmodders.length == 0){
				scriptversion = "<b><font color='red'>\u2022  The Server is using an old or possibly modified version of the Full Original Script.</font></b>";					
			}
			else {
				var scriptmodindex, scriptmodderlist = new Array();
				for (scriptmodindex in scriptmodders){
					scriptmodderlist[scriptmodindex] = members[scriptmodders[scriptmodindex]];
				}					
				scriptversion = "<b><font color='blue violet'>\u2022  The Server Script has been modified by " + String(scriptmodderlist).replace(/,/g, ", ") + ".</font></b>";
			}
		}

		,

		namecolor: function (src) {
			if (sys.getColor(src) == '#000000') {
 				var clist = ['#5811b1','#399bcd','#0474bb','#f8760d','#a00c9e','#0d762b','#5f4c00','#9a4f6d','#d0990f','#1b1390','#028678','#0324b1'];
				return clist[src % clist.length]; 
			}
			return sys.getColor(src);
		}

		,

		channelcount: function (){
			var channelarray = sys.channelIds();
			return channelarray.length;
		}

		,

		channelsonlineload: function(){
			channelsonline = new Object();
			channelsonline[0] = new Object();
			channelsonline[0].owners = new Array();
			channelsonline[0].admins = new Array();
			channelsonline[0].mods = new Array();
			channelsonline[0].touradmins = new Array();			
			channelsonline[0].topic = "Welcome to " + sys.channel(0) + "!";
			channelsonline[0].ReadyForTour = "off";
   		channelsonline[0].ForceTourBattles = "on";
   		channelsonline[0].AutoStartBattles = "on";
   		channelsonline[0].EnforceTourClauses = "off";  
   		channelsonline[0].combinecharacters = "off";
   		channelsonline[0].reversecharacters = "off"; 
			tour = new Object();
			tour[0] = new Object();
			tour[0].tourmode = 0;
		}

		,

		channelsregisteredload: function(){
			channelsregistered = new Object();
			try { 
				channelsregistered["|main|"] = JSON.parse(sys.getVal("Main_Channel"));
			}
			catch(error){
				print("Error: channelsregistered["|main|"] is unable to be set due to a JSON parse error.");
			}
			if (channelsregistered["|main|"].topic != undefined){
				channelsonline[0].topic = channelsregistered["|main|"].topic;
			}
			if (channelsregistered["|main|"].ReadyForTour != undefined){
				channelsonline[0].ReadyForTour = channelsregistered["|main|"].ReadyForTour;
			}
			if (channelsregistered["|main|"].ForceTourBattles != undefined){
				channelsonline[0].ForceTourBattles = channelsregistered["|main|"].ForceTourBattles;
			}
			if (channelsregistered["|main|"].AutoStartBattles != undefined){
				channelsonline[0].AutoStartBattles = channelsregistered["|main|"].AutoStartBattles;
			}
			if (channelsregistered["|main|"].EnforceTourClauses != undefined){
				channelsonline[0].EnforceTourClauses = channelsregistered["|main|"].EnforceTourClauses;
			}
			if (channelsregistered["|main|"].combinecharacters != undefined){
				channelsonline[0].combinecharacters = channelsregistered["|main|"].combinecharacters;
			}
			if (channelsregistered["|main|"].reversecharacters != undefined){
				channelsonline[0].reversecharacters = channelsregistered["|main|"].reversecharacters;
			}
			if (channelsregistered["|main|"].owners != undefined){
				channelsonline[0].owners = channelsregistered["|main|"].owners;
			}
			if (channelsregistered["|main|"].admins != undefined){
				channelsonline[0].admins = channelsregistered["|main|"].admins;
			}
			if (channelsregistered["|main|"].mods != undefined){
				channelsonline[0].mods = channelsregistered["|main|"].mods;
			}
			if (channelsregistered["|main|"].touradmins != undefined){
				channelsonline[0].touradmins = channelsregistered["|main|"].touradmins;
			}					
		}

		,

		setchannelauth: function(src, channel){
			var playername = sys.name(src), srcauth = sys.auth(src);
			if (channelsonline[channel].touradmins.indexOf(playername.toLowerCase()) != -1){
				playersonline[src].channeltourauth[channel] = 1;
			}
			if (channelsonline[channel].owners.indexOf(playername.toLowerCase()) != -1){
				playersonline[src].channelauth[channel] = 3;
				return;
			}
			if (channelsonline[channel].admins.indexOf(playername.toLowerCase()) != -1){
				playersonline[src].channelauth[channel] = 2;
				return;
			}
			if (channelsonline[channel].mods.indexOf(playername.toLowerCase()) != -1){
				playersonline[src].channelauth[channel] = 1;
				return;
			}
			playersonline[src].channelauth[channel] = 0;					
		}

		,

		sendmessage: function (str, channel){
			return sys.sendHtmlMessage(receiver, str, channel);
		}

		,

		mutedipsload: function(){
			mutedips = new Object();
			var muteexindex;
			for (muteexindex in muteexlist){
				mutedips[muteexlist[muteexindex].ip] = true;
			}
		}

		,

		mutecheck: function(name){
			if (muteexlist[name.toLowerCase()] != undefined){
				return true;
			}
			if (mutedips[sys.dbIp(name)]){
				return true;
			}
		}

		,

		mutemessage: function(src, channel){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are muted on the server.</i>", channel);
		}

		,

		failpermissionmessage: function (src, channel, command){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you do not have permission to use the " + command + " command.</i>", channel);
		}

		,

		kick: function(src, trgt){
			var srcname = sys.name(src), trgtname = sys.name(trgt);
			sys.sendHtmlAll("<timestamp/><font color='blue'><b>" + trgtname + " has been kicked from the server by " + srcname + "!</b></font>");
			sys.callQuickly("sys.kick(" + trgt + ");", 200);
		}

		,

		ban: function(srcname, trgtname, type){
			type = type == 1 ? "by IP address" : "";
			sys.sendHtmlAll("<timestamp/><font color='#FF6900'><b>" + trgtname + " has been banned " + type + " from the server by " + srcname + "!</b></font>");
			sys.ban(trgtname);
			banexlist[trgtname.toLowerCase()] = new Object();
			banexlist[trgtname.toLowerCase()].banner = srcname;
			sys.saveVal("BanEx_List", JSON.stringify(banexlist));
			var trgt = sys.id(trgtname);
			if (trgt != undefined){
				sys.callQuickly("sys.kick(" + trgt + ");", 200);
			}
		}

		,

		exportteam: function(sender, receiver, channel){
			var slot, srcname = sys.name(sender), gen = sys.gen(sender);
			var viewteammessage = border + "<br/>"
			+ "<b><font size='5'>" + srcname + "'s Gen" + gen + " Team</font></b><br/>";
			+ "<table>";
			var id = sys.teamPoke(sender, 0);
			if (id != 0){
				var gender = sys.teamPokeGender(sender, 0), gendername = ({ 2: "female", 1: "male", 0: "neutral"}[gender]), item = sys.teamPokeItem(sender, 0);
				viewteammessage += "<tr><td rowspan='1'><br/><br/><br/><img src='pokemon:num=" + id + "&shiny=false&" + "gender=" + gendername + "&gen=" + gen + "'/><br/>"
				+ "<img src='item:" + item + "'/></td>";
			}
			viewteammessage += "<td rowspan='6'>"
			for (slot = 0; slot < 6; slot++){
				var id = sys.teamPoke(sender, slot);
				if (id == 0){
					break;
				}
				var name = sys.pokemon(id), nick = sys.teamPokeNick(sender, slot), gender = sys.teamPokeGender(sender, slot), gendername = ({ 2: "female", 1: "male", 0: "neutral"}[gender]), genderletter = ({ 2: "(F)", 1: "(M)", 0: ""}[gender]),	 item = sys.teamPokeItem(sender, slot), itemname = sys.item(item);
				viewteammessage += nick + " (" + name + ") " + genderletter + " @ " + itemname + "<br/>";
				if (gen > 2){
					var ability = sys.teamPokeAbility(sender, slot), abilityname = sys.ability(ability);
					viewteammessage += "Trait: " + abilityname + "<br/>";
				}
				var ivs = new Array(), evs = new Array(), stat = {5: " Spd", 4: " SDef", 3: " SAtk", 2: " Def", 1: " Atk", 0: " HP"}, statslot;
				ivs.push(gen);
				for (statslot = 0; statslot < 6; statslot++){
					var ivstat = sys.teamPokeDV(sender, slot, statslot);
					if (statslot < 4){
						ivs.push(ivstat);
					}
					if (statslot == 4){
						ivs[5] = ivstat;
					}
					if (statslot == 5){
						ivs[6] = ivstat;
					}
					if (statslot == 6){
						ivs[4] = ivstat;
					}			
					var evstat = sys.teamPokeEV(sender, slot, statslot);
					if (evstat != 0){
						evs.push(evstat + stat[statslot]);
					}
				}
				if (evs.length != 0 && gen > 2){
					viewteammessage += "EVs: " + evs.join(" / ") + "<br/>";
				}
				if (gen > 2){
					var nature = sys.teamPokeNature(sender, slot), naturename = ({24: "Quirky Nature", 23: "Careful Nature (+SDef, -SAtk)", 22: "Sassy Nature (+SDef, -Spd)", 21: "Gentle Nature (+SDef, -Def)", 20: "Calm Nature (+SDef, -Atk)", 19: "Rash Nature (+SAtk, -SDef)", 18: "Bashful Nature", 17: "Quiet Nature (+SAtk, -Spd)", 16: "Mild Nature (+SAtk, -Def)", 15: "Modest Nature (+SAtk, -Atk)",
					14: "Naive Nature (+Spd, -SDef)", 13: "Jolly Nature (+Spd, -SAtk)", 12: "Serious Nature", 11: "Hasty Nature (+Spd, -Def)", 10: "Timid Nature (+Spd, -Atk)", 9: "Lax Nature (+Def, -SDef)", 8: "Impish Nature (+Def, -SAtk)", 7: "Relaxed Nature (+Def, -Spd)", 6: "Docile Nature", 5: "Bold Nature (+Def, -Atk)", 4: "Naughty Nature (+Atk, -SDef)", 3: "Adamant Nature (+Atk, -SAtk)",
					2: "Brave Nature (+Atk, -Spd)", 1: "Lonely Nature (+Atk, -Def)", 0: "Hardy Nature"})[nature];
					viewteammessage += naturename + "<br/>";
				}
				var moveslot;
				for (moveslot = 0; moveslot < 4; moveslot++){
					var move = sys.teamPokeMove(sender, slot, moveslot), movename = sys.move(move);
					if (move == 0){
						break;
					}
					if (move == 237){
						var hptype = sys.hiddenPowerType.apply(null,ivs), hptypename = sys.type(hptype);
						movename = "Hidden Power [" + hptypename + "]";
					}
					viewteammessage+= "- " + movename + "<br/>";
				}
				viewteammessage += "<br/>";
			}
			viewteammessage += "</td></tr>";
			for (slot = 1; slot < 6; slot++){
				var id = sys.teamPoke(sender, slot);
				if (id == 0){
					break;
				}
				var gender = sys.teamPokeGender(sender, slot), gendername = ({ 2: "female", 1: "male", 0: "neutral"}[gender]), item = sys.teamPokeItem(sender, slot);
				viewteammessage += "<tr><td rowspan='1'><br/><br/><img src='pokemon:num=" + id + "&shiny=false&" + "gender=" + gendername + "&gen=" + gen + "'/><br/>"
				+ "<img src='item:" + item + "'/></td></tr>";
			}			
			viewteammessage += "</table><timestamp/><br/>" 
			+ border;
			sys.sendHtmlMessage(receiver, viewteammessage, channel);
		}

		,

		loadteam: function(sender, receiver, channel){
			var slot, srcname = sys.name(sender), gen = sys.gen(sender);
			for (slot = 0; slot < 6; slot++){
				var id = sys.teamPoke(sender, slot);
				if (id == 0){
					break;
				}
				var nick = sys.teamPokeNick(sender, slot), gender = sys.teamPokeGender(sender, slot), item = sys.teamPokeItem(sender, slot), level = sys.teamPokeLevel(sender, slot);
				sys.changePokeNum(receiver, slot, id);
				sys.changePokeName(receiver, slot, nick);
				sys.changePokeGender(receiver, slot, gender);
				sys.changePokeItem(receiver, slot, item);
				sys.changePokeLevel(receiver, slot, level);
				if (gen > 1){
					var shiny = sys.teamPokeShine(sender, slot);
					sys.changePokeShine(receiver, slot, shiny);
				}
				if (gen > 2){
					var ability = sys.teamPokeAbility(sender, slot), nature = sys.teamPokeNature(sender, slot);
					sys.changePokeAbility(receiver, slot, ability);
					sys.changePokeNature(receiver, slot, nature);
				}
				var statslot;
				for (statslot = 0; statslot < 6; statslot++){
					var ivstat = sys.teamPokeDV(sender, slot, statslot), evstat = sys.teamPokeEV(sender, slot, statslot);
					sys.setTeamPokeDV(receiver, slot, statslot, ivstat);
					sys.changeTeamPokeEV(receiver, slot, statslot, evstat);
				}
				var moveslot;
				for (moveslot = 0; moveslot < 4; moveslot++){
					var move = sys.teamPokeMove(sender, slot, moveslot);
					if (move == 0){
						break;
					}
					sys.changePokeMove(receiver, slot, moveslot, move);
				}
			}
		}

		,

		listofclauses : function (number){
			var clauseslist = new Array();
			if (number >= 256){
				clauseslist.push("Self KO Clause");
				number -= 256;
			}
			if (number >= 128){
				clauseslist.push("Wifi Clause");
				number -= 128;
			}
			if (number >= 64){
				clauseslist.push("Species Clause");
				number -= 64;
			}
			if (number >= 32){
				clauseslist.push("No Timeout");
				number -= 32;
			}
			if (number >= 16){
				clauseslist.push("Challenge Cup");
				number -= 16;
			}
			if (number >= 8){
				clauseslist.push("Item Clause");
				number -= 8;
			}
			if (number >= 4){
				clauseslist.push("Disallow Spectators");
				number -= 4;
			}
			if (number >= 2){
				clauseslist.push("Freeze Clause");
				number -= 2;
			}
			if (number >= 1){
				clauseslist.push("Sleep Clause");
				number -= 1;
			}
			return clauseslist;
		}

		,

		fisheryates: function (myarray) {
			var i = myarray.length;
			if(i == 0) return false;
			while(--i){
				var j = Math.floor(Math.random()*(i + 1));
				var tempi = myarray[i];
				var tempj = myarray[j];
				myarray[i] = tempj;
				myarray[j] = tempi;
			}
		}

		,

		globaltourpermission: function (src, channel){
			return playersonline[src].tourauth == 1;
		}

		,

		tourpermission: function (src, channel){
			return playersonline[src].channeltourauth[channel] == 1 || playersonline[src].tourauth == 1;
		}

		,

		tourstart: function(channel){
			tour[channel].tourmode = 2;
			tour[channel].roundnumber = 0;
			helpers.roundpairing(channel);         
		}

		,

		tourcount: function(channel){
			return tour[channel].tournumber - tour[channel].tourmembers.length;
		}

		,

		tourdisplay: function (tourdisplayversion, channel){
			var send = tourdisplayversion == 0 ? sys.sendHtmlAll : helpers.sendmessage;
			var correctborder = tourdisplayversion == 0 ? border2 : border;
			var minutesago = Math.floor((new Date() - tour[channel].tourstarttime)/60000);
			var minutesstring = minutesago == 1 ? "minute" : "minutes";
			var minutesagostring = minutesago == 0 ? "" : " (started " + String(minutesago) + " " + minutesstring + " ago)";
			var spotsleftstring = helpers.tourcount(channel) == 1 ? "1 spot is left!" : String(helpers.tourcount(channel)) + " spots are left!" 
			var joinmodestring = tourdisplayversion == 0 || tourdisplayversion == 1 ? "<timestamp/><b>Type: <font color='green'>/join</font></b> to enter the tournament! " + spotsleftstring : "<timestamp/>Currently in Round " + tour[channel].roundnumber + ". Number of players left is " + (tour[channel].tourcurrentnumber - tour[channel].tourlosers.length) + ".";    
			var tourdisplay = correctborder + "<br/>"
			+ "<font color='mediumseagreen'><b>A Tournament has been started by " + tour[channel].tourstarter + "!" + minutesagostring + "</b></font><br/>"
			+ "<font color='blue'><b>PLAYERS:</b></font> " + String(tour[channel].tournumber) + "<br/>"
			+ "<font color='blueviolet'><b>TYPE:</b></font> Single Elimination<br/>"
			+ "<font color='red'><b>TIER:</b></font> " + tour[channel].tourtier + "<br/>"
			+ "<font color='darkorange'><b>CLAUSES:</b></font> " + String(helpers.listofclauses(tour[channel].tourclauses)).replace(/,/g, ", ") + "<br/>"
			+ correctborder +"<br/>"
			+ joinmodestring + "<br/>"
			+ correctborder
			send(tourdisplay, channel);
		}

		,

		roundincrease: function (winnername, losername, channel){
			var tourloser = tour[channel].tourbattlers.indexOf(losername);
			if (tourloser != - 1){
				tour[channel].tourbattlers.splice(tourloser,1);
				var tourwinner = tour[channel].tourbattlers.indexOf(winnername);
				tour[channel].tourbattlers.splice(tourwinner,1);
			}
			if (winnername != "|bye|"){
				if (tour[channel].tourlosers.indexOf(winnername) == -1){
					tour[channel].tourlosers.push(losername);
					tour[channel].tourwinners.push(winnername);
					sys.sendHtmlAll("<b>" + members[winnername] + " advances to the next round.</b>", channel);
				}
				else{
					tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(losername), 1);
					tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(winnername), 1);
					tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf(winnername), 1);
					tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf(losername), 1);
					tour[channel].tourcurrentnumber-= 2;
				}
			}
			else{
				tour[channel].tourmembers.splice(tour[channel].tourcurrentnumber, 1);
				tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf(losername), 1);
				tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(losername), 1);
				tour[channel].tourcurrentnumber--;
			}
			sys.sendHtmlAll(members[losername] + " is out of the tournament.", channel);
			var battlesleft = Math.floor((tour[channel].tourcurrentnumber - tour[channel].tourlosers.length - tour[channel].tourwinners.length)/2);
			if (battlesleft != 0 && tour[channel].tourlosers.indexOf(winnername) == -1 && tour[channel].tourmembers.indexOf(winnername) != -1){
				var plurality = battlesleft == 1 ? "match" : "matches";
				var battlesleftstring =  border2 + "<br/>" 
				+ "<font color='blue'><b>" + battlesleft + " more " + plurality  + " to be completed in this round!</b></font>";
				sys.sendHtmlAll(battlesleftstring, channel);
			}
			sys.sendHtmlAll(border2, channel);
			if (battlesleft == 0){
				if (tour[channel].tourmembers[tour[channel].tourcurrentnumber] == "|bye|"){
					tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf("|bye|"),1);
				}
				tour[channel].tourcurrentnumber -= tour[channel].tourlosers.length;
				if (tour[channel].tourcurrentnumber == 1){
					tour[channel].tourmode = 0;
					var winnermessage = border2 + "<br/>"
					+ "<font color='blue'><b>THE WINNER OF THE TOURNAMENT IS</b></font> " + members[winnername] + "<br/>"
					+ "<timestamp/><font color='green'><b>Congratulations, " + members[winnername] + ", on your success!</b></font><br/>"
					+ border2;
					sys.sendHtmlAll(winnermessage, channel);
					return;
				}
				helpers.roundpairing(channel);
			}
		}

		,

		roundpairing: function(channel){
			while (0 in tour[channel].tourlosers){
				tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf(tour[channel].tourlosers[0]),1);
				tour[channel].tourlosers.splice(0,1);
			}   
			while (0 in tour[channel].tourwinners){
				tour[channel].tourwinners.splice(0,1);
			}      
			tour[channel].roundnumber++;
			helpers.fisheryates(tour[channel].tourmembers);
			helpers.rounddisplay(1, channel);
			if (channelsonline[channel].AutoStartBattles == "on"){
				for (var tourmembersindex = 0; tourmembersindex < tour[channel].tourcurrentnumber-1; tourmembersindex+=2){
					var player1 = sys.id(tour[channel].tourmembers[tourmembersindex]), player2 = sys.id(tour[channel].tourmembers[tourmembersindex+1]);
					if (player1 != undefined && player2 != undefined){
						var player1tier = sys.tier(player1), player2tier = sys.tier(player2);
							if (player1tier == player2tier && player1tier == tour[channel].tourtier){
								sys.forceBattle(player1, player2, tour[channel].tourclauses, 0, 0);
							}
					}
				}
			}
		}

		,

		rounddisplay: function(rounddisplayversion, channel){
			var send = rounddisplayversion == 0 ? helpers.sendmessage : sys.sendHtmlAll;
			var correctborder = rounddisplayversion == 0 ? border : border2
			var finalroundcheck = tour[channel].tourcurrentnumber == 2 ? "Final Round" : "Round " + tour[channel].roundnumber;
			var roundstring = correctborder + "<br/>"
			+ "<timestamp/><font size=4><b>" + finalroundcheck + " of " + tour[channel].tourtier + " Tournament</b></font><br/>"
			+ correctborder + "<br/>";
			for (var tourmembersindex = 0 ; tourmembersindex < tour[channel].tourcurrentnumber-rounddisplayversion; tourmembersindex+=2){
				var tourspotone = tour[channel].tourlosers.indexOf(tour[channel].tourmembers[tourmembersindex]) != -1 ? "<s>" + members[tour[channel].tourmembers[tourmembersindex]] + "</s>" : members[tour[channel].tourmembers[tourmembersindex]];
				var tourspottwo = tour[channel].tourlosers.indexOf(tour[channel].tourmembers[tourmembersindex+1]) != -1 ? "<s>" + members[tour[channel].tourmembers[tourmembersindex+1]] + "</s>" : members[tour[channel].tourmembers[tourmembersindex+1]];
				tourspotone = tour[channel].tourbattlers.indexOf(tour[channel].tourmembers[tourmembersindex]) != -1 ? "<i>" + members[tour[channel].tourmembers[tourmembersindex]] + "</i>" : tourspotone;
				tourspottwo = tour[channel].tourbattlers.indexOf(tour[channel].tourmembers[tourmembersindex+1]) != -1 ? "<i>" + members[tour[channel].tourmembers[tourmembersindex+1]] + "</i>" : tourspottwo;
				tourspotone = tour[channel].tourmembers[tourmembersindex] == "|bye|" ? "|bye|" : tourspotone;
				tourspottwo = tour[channel].tourmembers[tourmembersindex+1] == "|bye|" ? "|bye|" : tourspottwo;
				roundstring += "<b>" + (tourmembersindex+2)/2 + ". " + tourspotone + " VS " + tourspottwo + "</b><br/>";
			}
			if (tour[channel].tourwinners.length > 0){
				var tourwinnerslist = "<b><small>", tourwinnersindex;
				for (tourwinnersindex in tour[channel].tourwinners){
					tourwinnerslist += members[tour[channel].tourwinners[tourwinnersindex]] + ", ";
				}
				tourwinnerslist = tourwinnerslist.substring(0, tourwinnerslist.length-2) + ".</small></b>"
				roundstring += correctborder + "<br/>"
				+ "<font color='green'><b>Players through to the Next Round</b></font><br/>" 
				+ correctborder + "<br/>"
				+ tourwinnerslist + "<br/>"
			}		
			if (tour[channel].tourlosers.length > 0){
				var tourloserslist = "<b><small>", tourlosersindex;
				for (tourlosersindex in tour[channel].tourlosers){
					tourloserslist += members[tour[channel].tourlosers[tourlosersindex]] + ", ";
				}
				tourloserslist = tourloserslist.substring(0, tourloserslist.length-2) + ".</small></b>"
				roundstring += correctborder + "<br/>"
				+ "<font color='red'><b>Players out of the tournament</b></font><br/>" 
				+ correctborder + "<br/>"
				+ "<b><small>" + tourloserslist + "</small></b><br/>"
			}
			roundstring += correctborder;
			if (tour[channel].tourmembers.length % 2 == 1){
				tour[channel].tourmembers.push("|bye|");
				tour[channel].tourwinners.push(tour[channel].tourmembers[tour[channel].tourcurrentnumber-1]);
				roundstring += "<br/>"
				+ "<font color='green'><b>" + members[tour[channel].tourmembers[tour[channel].tourcurrentnumber-1]] + " is randomly selected to go through to the next round!</b></font><br/>"
				+ correctborder;
			}
			send(roundstring, channel);
		}

		,

		tourmembersnumber: function(name, channel){
			if (tour[channel].tourmode != 0){
				var tourmembersnumber = tour[channel].tourmembers.indexOf(name);
				if (tourmembersnumber != -1){
					return tourmembersnumber;
				}
			}
		}

		,

		tourmembersname: function(number, channel){
			if (number <= tour[channel].tourcurrentnumber){
				return members[tour[channel].tourmembers[number]];
			}
		}

		,

		tourloserscheck: function (name, channel){
			return tour[channel].tourlosers.indexOf(name) == -1 ? true: false;
		}

		,

		opponentof: function (name, channel){
			var tourmembersnumber = helpers.tourmembersnumber(name, channel);
			return tourmembersnumber % 2 == 0 ? tour[channel].tourmembers[tourmembersnumber+1]: tour[channel].tourmembers[tourmembersnumber-1];
		}

		,

		nopair: function(index1, index2){
			return (index1 % 2 == 0 && index2 != index1 + 1) || (index1 % 2 == 1 && index1 != index2 + 1) ? true: false;
		}
	}
	helpers.setregvalue("Tiers_Options_TiersName", "servertiers");
	helpers.setvariable("tiersname", sys.getVal("Tiers_Options_TiersName"));
	helpers.setregvalue("Tiers_Options_TiersLinks", '{"po":"http://pokemonperfect.co.uk/po_tiers.xml","smogon":"http://pokemonperfect.co.uk/smogon_tiers.xml"}');
	helpers.setobjectvariable("tierslinks", sys.getVal("Tiers_Options_TiersLinks"));
	helpers.setregvalue("Script_Options_RegisteredDate", String(new Date()));
	helpers.setvariable("registereddate", sys.getVal("Script_Options_RegisteredDate"));
	helpers.setregvalue("Script_Options_ScriptName", "serverscript");
	helpers.setvariable("scriptname", sys.getVal("Script_Options_ScriptName"));
	helpers.setregvalue("Script_Options_ServerScriptLink", "http://pokemonperfect.co.uk/serverscript.txt");
	helpers.setvariable("serverscriptlink", sys.getVal("Script_Options_ServerScriptLink"));
	helpers.setregvalue("Script_Options_AutoUpdateScriptLink", "http://pokemonperfect.co.uk/webcallscript.txt");
	helpers.setvariable("autoupdatescriptlink", sys.getVal("Script_Options_AutoUpdateScriptLink"));
	helpers.setregvalue("Script_Options_ScriptModders", "[]");
	helpers.setobjectvariable("scriptmodders", sys.getVal("Script_Options_ScriptModders"));
	helpers.setregvalue("Script_Options_ScriptThanked", '["coyotte508","Lamperi","Intel_iX","Mystra","NeO","Juno","nesan","kupo", "TheUnknownOne", "SkarmPiss", "GaryTheGengar"]');
	helpers.setobjectvariable("scriptthanked", sys.getVal("Script_Options_ScriptThanked"));
	helpers.setregvalue("Script_Options_ScriptContributors", "[]");
	helpers.setobjectvariable("scriptcontributors", sys.getVal("Script_Options_ScriptContributors"));
	helpers.setregvalue("Commands_Options_MessageCommands", "{}");
	helpers.setobjectvariable("messagecommands", sys.getVal("Commands_Options_MessageCommands"));
	helpers.setregvalue("Variable_Options_VariableChanges", "on");
	helpers.setvariable("variablechanges", sys.getVal("Variable_Options_VariableChanges"));
	helpers.setvariable("serverversion", sys.serverVersion());
	helpers.setvariable("status", sys.isServerPrivate() ? "private" : "public");
	helpers.setvariable("open", true);
	helpers.setvariable("playersonline", new Object());
	helpers.setregvalue("Flood_Options_FloodTime", 10);
	helpers.setvariable("floodtime", sys.getVal("Flood_Options_FloodTime"));
	helpers.setregvalue("Flood_Options_MessageAllowance", 8);
	helpers.setvariable("messageallowance", sys.getVal("Flood_Options_MessageAllowance"));
	helpers.setvariable("floodplayers", new Array());
	helpers.setvariable("silence", 0);
	helpers.setvariable("shutdown", false);
	helpers.setregvalue("Event_Options_FindBattleMessage", "on");
	helpers.setvariable("findbattlemessage", sys.getVal("Event_Options_FindBattleMessage"));
	helpers.setvariable("battlesonline", new Object());
	helpers.setvariable("battlers", new Array());
	helpers.setregvalue("RangeBanEx_List", "{}");
	helpers.setobjectvariable("rangebanexlist", sys.getVal("RangeBanEx_List"));
	helpers.setregvalue("BanEx_List", "{}");
	helpers.setobjectvariable("banexlist", sys.getVal("BanEx_List"));
	helpers.setregvalue("MuteEx_List", "{}");
	helpers.setobjectvariable("muteexlist", sys.getVal("MuteEx_List"));
	helpers.setvariableprocedure("mutedips", "mutedipsload");
	helpers.setregvalue("Ip_List", "{}");
	helpers.setobjectvariable("iplist", sys.getVal("Ip_List"));
	helpers.setregvalue("Alias_List", "{}");
	helpers.setobjectvariable("aliaslist", sys.getVal("Alias_List"));
	helpers.setregvalue("AntiMember_List", "{}");
	helpers.setobjectvariable("antimemberlist", sys.getVal("AntiMember_List"));
	helpers.setvariable("symbollist", sys.getVal("Symbol_List"));
	helpers.setregvalue("Authority_Options_AuthLevel0Name", "User");
	helpers.setvariable("AuthLevel0Name", sys.getVal("Authority_Options_AuthLevel0Name"));
	helpers.setregvalue("Authority_Options_AuthLevel1Name", "Moderator");
	helpers.setvariable("AuthLevel1Name", sys.getVal("Authority_Options_AuthLevel1Name"));
	helpers.setregvalue("Authority_Options_AuthLevel2Name", "Administrator");
	helpers.setvariable("AuthLevel2Name", sys.getVal("Authority_Options_AuthLevel2Name"));
	helpers.setregvalue("Authority_Options_AuthLevel3Name", "Owner");
	helpers.setvariable("AuthLevel3Name", sys.getVal("Authority_Options_AuthLevel3Name"));
	helpers.setregvalue("Authority_Options_TourAuthLevel0Name", "Tour User");
	helpers.setvariable("TourAuthLevel0Name", sys.getVal("Authority_Options_TourAuthLevel0Name"));
	helpers.setregvalue("Authority_Options_TourAuthLevel1Name", "Tour Admin");
	helpers.setvariable("TourAuthLevel1Name", sys.getVal("Authority_Options_TourAuthLevel1Name"));
	helpers.setregvalue("Authority_Options_ChannelAuthLevel0Name", "Channel User");
	helpers.setvariable("ChannelAuthLevel0Name", sys.getVal("Authority_Options_ChannelAuthLevel0Name"));
	helpers.setregvalue("Authority_Options_ChannelAuthLevel1Name", "Channel Mod");
	helpers.setvariable("ChannelAuthLevel1Name", sys.getVal("Authority_Options_ChannelAuthLevel1Name"));
	helpers.setregvalue("Authority_Options_ChannelAuthLevel2Name", "Channel Admin");
	helpers.setvariable("ChannelAuthLevel2Name", sys.getVal("Authority_Options_ChannelAuthLevel2Name"));
	helpers.setregvalue("Authority_Options_ChannelAuthLevel3Name", "Channel Owner");
	helpers.setvariable("ChannelAuthLevel3Name", sys.getVal("Authority_Options_ChannelAuthLevel3Name"));
	helpers.setregvalue("Authority_Options_ChannelTourAuthLevel0Name", "Channel Tour User");
	helpers.setvariable("ChannelTourAuthLevel0Name", sys.getVal("Authority_Options_ChannelTourAuthLevel0Name"));
	helpers.setregvalue("Authority_Options_ChannelTourAuthLevel1Name", "Channel Tour Admin");
	helpers.setvariable("ChannelTourAuthLevel1Name", sys.getVal("Authority_Options_ChannelTourAuthLevel1Name"));
	helpers.setvariableprocedure("members", "memberslist");
	helpers.setvariableprocedure("port", "configload");
	helpers.setregvalue("Authority_Options_TourAuthLevel1List", "[]");
	helpers.setobjectvariable("tourauth", sys.getVal("Authority_Options_TourAuthLevel1List"));
	helpers.setregvalue("Battle_Record", battlers.length/2);
	helpers.setvariable("battlerecord", sys.getVal("Battle_Record"));
	helpers.setregvalue("Total_Battles", 0);
	helpers.setvariable("totalbattles", sys.getVal("Total_Battles"));
	helpers.setregvalue("Player_Record", sys.numPlayers());
	helpers.setvariable("playerrecord", sys.getVal("Player_Record"));
	helpers.setregvalue("Channel_Record", helpers.channelcount());
	helpers.setvariable("channelrecord", sys.getVal("Channel_Record"));
	helpers.setvariableprocedure("", "serverscriptdownload");
	helpers.setvariableprocedure("", "autoupdatescriptdownload");
	scriptcontent = sys.getFileContent("scripts.js");
	helpers.setvariableprocedure("", "scriptversion");
	helpers.setregvalue("Server_Topic","Enjoy your stay at " + servername + "!");
	helpers.setvariable("servertopic", sys.getVal("Server_Topic"));
	helpers.setvariableprocedure("channelsonline", "channelsonlineload");
	helpers.setregvalue("Channel_Options_RegisteredChannels", "[]");
	helpers.setobjectvariable("registeredchannels", sys.getVal("Channel_Options_RegisteredChannels"));
	helpers.setregvalue("Channel_Options_RegisteredChannelsLimit", 25);
	helpers.setvariable("registeredchannelslimit", sys.getVal("Channel_Options_RegisteredChannelsLimit"));
	helpers.setregvalue("Main_Channel", "{}");
	helpers.setvariableprocedure("channelsregistered", "channelsregisteredload");
	helpers.setregvalue("Quasi_English", "off");
	helpers.setvariable("quasienglish", sys.getVal("Quasi_English"));
	helpers.setvariable("future", new Object());
	helpers.setregvalue("Future_Limit", "5");
	helpers.setvariable("futurelimit", sys.getVal("Future_Limit"));
	border = "<font color='Cornflowerblue'><b>\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB</b></font>";
	border2 = "<font color='MediumBlue'><b>\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB</b></font>";
	border3 = "<font color='DarkBlue'><b>\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB\u00BB</b></font>";
	border4 = "<b>//////////////////////////////////////////////////////////////////</b>";
	typecommands = "<b><font color='orangered'>The following commands need to be entered into a channel's main chat:</font></b>";
	scriptlastload = new Date();
	commands = new Object();
	commands = {
		commands: function (src, channel, command){
		var commandsdisplay = border
		+ "<h2>Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022 <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel3Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(AuthLevel3Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel2Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(AuthLevel2Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel1Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(AuthLevel1Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel0Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(AuthLevel0Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(TourAuthLevel1Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(TourAuthLevel1Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(TourAuthLevel0Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(TourAuthLevel0Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel3Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(ChannelAuthLevel3Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel2Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(ChannelAuthLevel2Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel1Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(ChannelAuthLevel1Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel0Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(ChannelAuthLevel0Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelTourAuthLevel1Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(ChannelTourAuthLevel1Name).toLowerCase() + " commands.<br/>"
		+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelTourAuthLevel0Name)).toLowerCase() + "commands</b></font>: displays the " + helpers.escapehtml(ChannelTourAuthLevel0Name).toLowerCase() + " commands.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>" 
		+ border;
		sys.sendHtmlMessage(src, commandsdisplay, channel);
		}

		,

		chatoptions: function(src, channel, command){
			var chatoptionsdisplay = border
			+ "<h2>Chat Options</h2>"
			+ "<br/>"
			+ "<font color='maroon'><b>\u2022  The Server topic is currently " + helpers.escapehtml(servertopic).italics() + "</b></font><br/>"
			+ "<font color='green'><b>\u2022  Quasi-English characters are currently turned " + quasienglish + ".</b></font><br/>"
			+ "<font color='indigo'><b>\u2022 The Future Limit is currently set to " + futurelimit + " messages.</b></font><br/>" 
			+ "<h3>Chat Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/tempservertopic</font><font color='red'> topic</font></b>: changes the server topic to <b>topic</b> for the duration the server is open for. <b>topic</b> is any text. If <b>topic</b> is <i>off</i>, turns the server topic feature off. If <b>topic</b> is <i>default</i>, changes the server topic to <i>Enjoy your stay at " + servername + "</i><br/>" 
			+ "<b>\u2022  <font color='green'>/servertopic</font><font color='red'> topic</font></b>: changes the server topic to <b>topic. </b><b>topic</b> is any text. If <b>topic</b> is <i>off</i>, turns the server topic feature off. If <b>topic</b> is <i>default</i>, changes the server topic to <i>Enjoy your stay at " + servername + "</i><br/>"
			+ "<b>\u2022  <font color='green'>/quasienglish</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, players can use characters resembling english ones in their names; if <b>status</b> is <i>off</i>, they cannot use them in their names.<br/>"
			+ "<b>\u2022  <font color='green'>/futurelimit</font><font color='red'> number</font></b>: sets the maximum limit of future messages to <b>number</b>.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, chatoptionsdisplay, channel);			
		}

		,

		cmdsoptions: function(src, channel, command){
			var commandskeys = Object.keys(commands), commandstotal = Object.keys(commands).length, msgcommandstotal = Object.keys(messagecommands).length, commandsindex, commandslist = "<b><small>";
			commandskeys.sort();
			for (commandsindex in commandskeys){
				if (messagecommands[commandskeys[commandsindex]] === undefined){
					commandslist += commandskeys[commandsindex] + ", ";
					continue;
				}
				commandslist += "<font color='blue'>" + commandskeys[commandsindex] + "</font>, ";
			}
			commandslist = commandslist.substring(0, commandslist.length-2) + ".</small></b>"
			var cmdsoptionsdisplay = border
			+ "<h2>Commands Options</h2>"
			+ "<b><u>Commands List</u></b><br/><br/>"
			+ commandslist + "<br/>"
			+ "<br/>"
			+ "<b>Total Number of Commands:</b> " + commandstotal + "<br/>"
			+ "<b><font color='blue'>Total Number of Message Commands:</font></b> " + msgcommandstotal
			+ "<h3>Commands Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/writemsgcmd</font><font color='red'> name</font><font color='blue'>*html</font></b>: creates/overwrites a message command called <b>name</b> containing <b>html</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/deletemsgcmd</font><font color='red'> name</font></b>: deletes a message command called <b>name</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/clearmsgcmds</font></b>: deletes all message commands.<br/>"						
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cmdsoptionsdisplay, channel);		
		}

		,

		helpersoptions: function(src, channel, command){
			var helperslist = "<b><small>" + String(Object.keys(helpers)).replace(/,/g, ", ") + ".</small></b>", helperstotal = Object.keys(helpers).length;
			var helpersoptionsdisplay = border
			+ "<h2>Helpers Options</h2>"
			+ "<h3><u>Helpers List</u></h3>"
			+ helperslist + "<br/>"
			+ "<br/>"
			+ "<b>Total Number of Helpers:</b> " + helperstotal
			+ "<h3>Helpers Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, helpersoptionsdisplay, channel);			
		}

		,

		sessionoptions: function(src, channel, command){
			var sessionlist = "<b><small>" + String(Object.keys(SESSION)).replace(/,/g, ", ") + ".</small></b>", sessiontotal = Object.keys(SESSION).length;
			var sessionoptionsdisplay = border
			+ "<h2>SESSION Options</h2>"
			+ "<h3><u>SESSION Keys List</u></h3>"
			+ sessionlist + "<br/>"
			+ "<br/>"
			+ "<b>Total Number of Session keys:</b> " + sessiontotal
			+ "<h3>Session Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, sessionoptionsdisplay, channel);			
		}

		,

		dboptions: function(src, channel, command){
			var dboptionsdisplay = border
			+ "<h2>Database Options</h2>"
			+ "<br/>"
			+ "<h3>Database Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/resetladder</font><font color='red'> tier</font></b>: resets the ladder for <b>tier</b>. <b>tier</b> is any of the server's tiers.<br/>"
			+ "<b>\u2022  <font color='green'>/clearladders</font></b>: resets all of the server's ladders.<br/>"
			+ "<b>\u2022  <font color='green'>/exportladders</font></b>: exports the tier ratings database.<br/>"
			+ "<b>\u2022  <font color='green'>/changerating</font><font color='red'> player</font><font color='blue'>*tier</font><font color='blueviolet'>*rating</font></b>: changes the rating of <b>player</b> in <b>tier</b> to <b>rating</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/exportmembers</font></b>: exports the member database.<br/>"
			+ "<b>\u2022  <font color='green'>/clearpass</font><font color='red'> player</font></b>: clears <b>player</b>'s password.<b> player</b> is any player in the member database.<br/>"
			+ "<b>\u2022  <font color='green'>/deleteplayer</font><font color='red'> player</font></b>: deletes <b>player</b> from the database for next startup.<b> player</b> is any player in the member database.<br/>"  
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, dboptionsdisplay, channel);			
		}

		,

		runoptions: function(src, channel, command){
			var openorclosed = open === true? "open" : "closed";
			var runoptionsdisplay = border
			+ "<h2>Run Options</h2>"
			+ "<br/>"
			+ "<b><font color='red'>\u2022  The Server is currently " + openorclosed + " to player connections.</font></b><br/>"
			+ "<b>\u2022  The Server is currently " + status + ".</b><br/>"	
			+ "<h3>Run Option Commands</h3>"
			+ "<br/>" 
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/open</font></b>: opens the server to all player connections.<br/>"
			+ "<b>\u2022  <font color='green'>/close</font></b>: closes the server to all player connections except 127.0.0.1.<br/>"	
			+ "<b>\u2022  <font color='green'>/public</font></b>: changes the server to public.<br/>"
			+ "<b>\u2022  <font color='green'>/private</font></b>: changes the server to private.<br/>"
			+ "<b>\u2022  <font color='green'>/disconnectall</font></b>: disconnects all players online from the server.<br/>"
			+ "<b>\u2022  <font color='green'>/lockout</font></b>: disconnects all players online from the server and closes the server to all player connections except 127.0.0.1.<br/>"
			+ "<b>\u2022  <font color='green'>/shutdown</font></b> or <b><font color='green'>/shutdown</b></font><font color='red'><b> number</b></font><font color='blue'><b>*unit</b></font>: shuts the server down immediately or in <b>number</b> <b>unit</b>. <b>number</b> is any non-negative value. <b>unit</b> is either seconds, minutes, hours, days, weeks, months or years.<br/>"
			+ "<b>\u2022  <font color='green'>/cancelshutdown</b></font>: Cancels a planned shutdown.<br/>"	
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, runoptionsdisplay, channel);
		}

		,

		tiersoptions: function(src, channel, command){
			var tierslinksindex, tierslinklist = "";
			for (tierslinksindex in tierslinks){
				tierslinklist += "<b>\u2022 " + tierslinksindex + ": <i><a href='" + tierslinks[tierslinksindex] + "'>" + tierslinks[tierslinksindex] + "</a></i></b><br/>";
			}
			var tiersoptionsdisplay = border
			+ "<h2>Tiers Options</h2>"
			+ "<br/>"
			+ "<font color='green'><b>\u2022  The tiers name is currently known as " + tiersname.italics() + ".</b></font><br/>"
			+ tierslinklist
			+ "<h3>Tiers Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/tiersname</font><font color='red'> name</font></b>: saves the name of the tiers as <b>name</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/tierslinksupdate</font></b>: updates the tierslinks object for possible new URLs (clears any keys added by /tierslinkwrite).<br/>"	
			+ "<b>\u2022  <font color='green'>/tiersload</font></b>: loads the tiers from file.<br/>"
			+ "<b>\u2022  <font color='green'>/tiersimport</font><font color='red'> file</font></b>: loads the tiers from <b>file</b> within the PO server folder and overwrites.<br/>"
			+ "<b>\u2022  <font color='green'>/tiersexport</font></b>: exports the tiers to " + tiersname + ".xml<br/>"
			+ "<b>\u2022  <font color='green'>/tiersinstall</font><font color='red'> key</font></b>: downloads the tiers via the link stored under <b>key</b> and loads the tiers from file.<br/>"
			+ "<b>\u2022  <font color='green'>/tierslast</font></b>: loads your last tiers before you loaded another tiers by command.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, tiersoptionsdisplay, channel);			
		}

		,

		scriptoptions: function(src, channel, command){
			var scriptoptionsdisplay = border
			+ "<h2>Script Options</h2>"
			+ "<br/>"
			+ "<b>\u2022  The Server Script is currently known as " + scriptname.italics() + ".</b><br/>"
			+ "<b><font color='blue'>\u2022  The Full Original Script web URL is currently <a href='" + serverscriptlink + "'>" + serverscriptlink.italics() + "</a></font></b><br/>"			
			+ "<b><font color='green'>\u2022  The Auto-Update Script web URL is currently <a href='" + autoupdatescriptlink + "'>" + autoupdatescriptlink.italics() + "</a></font></b><br/>"
			+ scriptversion + "<br/>"
			+ "<font color='goldenrod'><b>\u2022 The current Script Contributors are: " + String(scriptcontributors).replace(/,/g, ", ") + "</b></font><br/>"
			+ "<font color='darkgoldenrod'><b>\u2022 The current Script Special Thanks List is: " +  String(scriptthanked).replace(/,/g, ", ") + "</b></font>"
			+ "<h3>Script Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/scriptname</font><font color='red'> name</font></b>: saves the name of the script as <b>name</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptupdatelinks</font></b>: updates the auto-update and full script URLs to their latest form.<br/>"		
			+ "<b>\u2022  <font color='green'>/scriptserverlink</font><font color='red'> link</font></b>: saves the web URL for  the full script as <b>link.</b><br/>"	
			+ "<b>\u2022  <font color='green'>/scriptautolink</font><font color='red'> link</font></b>: saves the web URL for  the auto-update script as <b>link.</b><br/>"		
			+ "<b>\u2022  <font color='green'>/scriptload</font></b>: loads the script from file. (loads latest script if using auto-update script)<br/>"
			+ "<b>\u2022  <font color='green'>/scriptreload</font></b>: reloads the script (except events) stored by the server.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptchange</font><font color='red'> file</font></b>: loads the script from <b>file</b> within the PO server folder.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptimport</font><font color='red'> file</font></b>: loads the script from <b>file</b> within the PO server folder and overwrites.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptexport</font></b>: exports the script to " + scriptname + ".txt<br/>"
			+ "<b>\u2022  <font color='green'>/scriptfull</font></b>: loads the latest full script.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptautoupdate</font></b>: loads the latest auto-update script.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptlast</font></b>: loads your last script before you loaded another script by command.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptmod</font></b> or <b><font color='gray'>/scriptmod</font><font color='red'> name</font></b>: declares the current script as your modification of the original script.<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptdemod</font></b> or <b><font color='gray'>/scriptdemod</font><font color='red'> name</font></b>: undeclares the current script as your modification of the original script.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptunmod</font></b>: undeclares the current script as a modification of the original script and clears all names added with /scriptmod.<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptupdatethanks</font></b>: updates the special thanks list of the script (clears any additional done with /scriptthank).<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptthank</font><font color='red'> name</font></b>: adds <b>name</b> to the script special thanks list.<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptdethank</font><font color='red'> name</font></b>: removes <b>name</b> from the script special thanks list.<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptupdatecontribs</font></b>: updates the contributors to the script (clears any additional done with /scriptcontrib).<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptcontrib</font><font color='red'> name</font></b>: adds <b>name</b> as a contributor to the script.<br/>"
			+ "<b>\u2022  <font color='gray'>/scriptdecontrib</font><font color='red'> name</font></b>: removes <b>name</b> as a contributor to the script.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, scriptoptionsdisplay, channel);
		}

		,

		sysoptions: function(src, channel, command){
			var syslist = "<b><small>", systotal = 0, sysindex;
			for (sysindex in sys){
				if (typeof sys[sysindex] === "function"){
					syslist += sysindex + ", ";
					systotal++;
				}
			}			
			syslist = syslist.substring(0, syslist.length-2) + ".</small></b>";
			var sysoptionsdisplay = border
			+ "<h2>Sys Options</h2>"
			+ "<h3><u>Scripting Functions List</u></h3>"
			+ syslist + "<br/>"
			+ "<br/>"
			+ "<b>Total Number of Scripting Functions:</b> " + systotal + "<br/>"  
			+ "<h3>Sys Option Commands</h3>"
			+ "<br/>" 
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/sys</font><font color='red'> function_path</font><font color='blue'>*parameters</font></b>: calls the function located at <b>function_path</b> with <b>parameters</b>. <b>function_path</b> is the path from sys where the function is stored. <b>parameters</b> must be separated by: <i>,</i><br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, sysoptionsdisplay, channel);
		}

		,

		eventoptions: function(src, channel, command){
			var eventslist = "<b><small>", eventstotal = Object.keys(script).length, acteventstotal = 0, eventsindex;
			for (eventsindex in script){
				if (String(script[eventsindex]).split("{\u000A\t}").length == 1){
					eventslist += "<font color='green'>" + eventsindex + "</font>, ";
					acteventstotal++;
					continue;
				}
				eventslist += eventsindex + ", ";
			}
			eventslist = eventslist.substring(0, eventslist.length-2) + ".</small></b>";
			var eventoptionsdisplay = border
			+ "<h2>Event Options</h2>"
			+ "<h3><u>Events List</u></h3>"
			+ eventslist + "<br/>"
			+ "<br/>"
			+ "<font color='blue'><b>\u2022 The Find Battle event message is currently turned " + findbattlemessage + ".</b></font><br/>"
			+ "<br/>"
			+ "<b><font color='green'>Total Number of Active Events:</font></b> " + acteventstotal + "<br/>" 
			+ "<b>Total Number of Events:</b> " + eventstotal + "<br/>" 
			+ "<br/>" 
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/findbattlemessage</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, shows Find Battle event message in the main chat in all channels; if <b>status</b> is <i>off</i>, the message isn't shown.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, eventoptionsdisplay, channel);
		}

		,

		execoptions: function(src, channel, command){
			var props = Object.getOwnPropertyNames(global), propslist = "<b><small>", propstotal = 0, propsindex;
			for (propsindex in props){
				if (!global.propertyIsEnumerable(props[propsindex])){
					propslist += props[propsindex] + ", ";
					propstotal++;
				}
			}
			propslist = propslist.substring(0, propslist.length-2) + ".</small></b>";
			var executiveoptionsdisplay = border 
			+ "<h2> Executive Options </h2>"
			+ "<h3><u>Unenumerable Global Property List</u></h3>"
			+ propslist + "<br/>"
			+ "<br/>"
			+ "<b>Total Number of Unenumerable Global Properties:</b> " + propstotal + "<br/>"   
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='gray'>/tempexec</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, shows script evaluations/executions in the main chat in all channels for the duration the server is open for; if <b>status</b> is <i>off</i>, the evaluations/executions aren't shown.<br/>"
			+ "<b>\u2022  <font color='gray'>/exec</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, shows script evaluations/executions in the main chat in all channels; if <b>status</b> is <i>off</i>, the evaluations/executions aren't shown.<br/>"
			+ "<b>\u2022  <font color='green'>/eval</font><font color='red'> string</font></b>: evaluates/executes <b>string</b>. <b>string</b> is a JavaScript expression, variable, statement or sequence of statements.<br/>"
			+ "<b>\u2022  <font color='gray'>/evallater</font><font color='red'> string</font><font color='blue'>*number</font><font color='blue violet'>*unit</font></b>: evaluates/executes <b>string</b> in <b> time unit</b>. <b>string</b> is a JavaScript expression, variable, statement or sequence of statements. <b>number</b> is any non-negative value.<b> unit</b> is either seconds, minutes, hours or days.<br/>"
			+ "<b>\u2022  <font color='gray'>/webcall</font><font color='red'> web_URL</font><font color='blue'>*string</font></b>: calls <b>web_URL</b> and evaluates/executes <b>string</b> when the reply is received. The reply is stored in the resp global variable. <b>string</b> is a JavaScript expression, variable, statement or sequence of statements.<br/>"
			+ "<b>\u2022  <font color='green'>/print</font><font color='red'> data</font></b>: prints <b>data</b> on the server window. <b>data</b> is a global variable, object, string, number or boolean.<br/>"
			+ "<b>\u2022  <font color='green'>/clear</font></b>: clears the server window.<br/>"
			+ "<b>\u2022  <font color='green'>/system</font><font color='red'> command</font></b>: runs <b>command</b> on the underlying operating system.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, executiveoptionsdisplay, channel);		
		}

		,

		varoptions: function (src, channel, command){
			var globallist = "<b><small>", globaltotal = Object.keys(global).length, globalindex, colortype = ({"object": "red", "function" : "blue", "number": "blueviolet", "string" : "green", "boolean" : "indigo"}), datatypetotal = new Object();
			for (globalindex in global){
				if (datatypetotal[typeof global[globalindex]] === undefined){
					datatypetotal[typeof global[globalindex]] = 0;
				}
				datatypetotal[typeof global[globalindex]] += 1;
				globallist += "<font color='" + colortype[typeof global[globalindex]] + "'>" + globalindex + "</font>" + ", ";
			}
			globallist = globallist.substring(0, globallist.length-2) + ".</small></b>";
			var dataoptionsdisplay = border
			+ "<h2>Variable Options</h2>"
			+ "<h3><u>Global Variables List</u></h3>"
			+ globallist + "<br/>"
			+ "<br/>"
			+ "<b><font color='red'>Total Number of Object Variables:</font></b> " + datatypetotal.object + "<br/>"
			+ "<b><font color='blue'>Total Number of Function Variables:</font></b> " + datatypetotal["function"] + "<br/>"
			+ "<b><font color='blueviolet'>Total Number of Number Variables:</font></b> " + datatypetotal.number + "<br/>"
			+ "<b><font color='green'>Total Number of String Variables:</font></b> " + datatypetotal.string + "<br/>"
			+ "<b><font color='indigo'>Total Number of Boolean Variables:</font></b> " + datatypetotal["boolean"] + "<br/>"
			+ "<b>Total Number of Global Variables:</b> " + globaltotal + "<br/>"
			+ "<br/>"
			+ "<b><font color='darkviolet'>\u2022 The showing of variable changes is currently turned " + variablechanges + "</font></b>"
			+ "<h3>Variable Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/tempvarchanges</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, shows changes to variables and player arrays in the main chat in all channels for the duration the server is open for; if <b>status</b> is <i>off</i>, the changes aren't shown.<br/>"
			+ "<b>\u2022  <font color='green'>/varchanges</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, shows changes to variables and player arrays in the main chat in all channels; if <b>status</b> is <i>off</i>, the changes aren't shown.<br/>"
			+ "<b>\u2022  <font color='green'>/get</font><font color='red'> variable</font></b>: displays the data within <b>variable</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/getkeys</font><font color='red'> object_variable</font></b>: displays all the keys within an object stored by <b>object_variable</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/getvalues</font><font color='red'> object_variable</font></b>: displays all the values within an object stored by <b>object_variable</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/getmembers</font><font color='red'> object_variable</font></b>: displays all the members within an object stored by <b>object_variable</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/getlength</font><font color='red'> variable</font></b>: displays the number of characters for a string, number of keys for an object and number of parameters for a function.<br/>"
			+ "<b>\u2022  <font color='green'>/set</font><font color='red'> variable</font><font color='blue'>*data</font></b>: creates a variable called <b>variable</b> storing <b>data</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/save</font><font color='red'> variable</font><font color='blue'>*data</font></b>: creates/overwrites a variable called <b>variable</b> storing <b>data</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/delete</font><font color='red'> variable</font></b>: deletes <b>variable</b>.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, dataoptionsdisplay, channel);			
		}

		,

		regvaloptions: function (src, channel, command){
			var dataoptionsdisplay = border
			+ "<h2>Registry Options</h2>"
			+ "<h3><u>Registry Values in default file</u></h3>"
			+ "<b><small>" + String(sys.getValKeys()).replace(/,/g,", ") + "</small></b>.<br/>"
			+ "<h3>Registry Value Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='gray'>/regfile</font><font color='red'> filename</font></b>: changes the registry file to <b>filename</b>.<br/>"
			+ "<b>\u2022  <font color='gray'>/getval</font><font color='red'> regkey</font></b>: displays the data within <i>Script_<b>regkey</b></i> in registry file.<br/>"
			+ "<b>\u2022  <font color='gray'>/getvals</font></b>: displays all the registry value data within in registry file.<br/>"
			+ "<b>\u2022  <font color='gray'>/getvalmembers</font></b>: displays all the registry value names and data within in registry file.<br/>"
			+ "<b>\u2022  <font color='gray'>/setval</font><font color='red'> regkey</font><font color='blue'>*data</font></b>: creates <i>Script_<b>regkey</b></i> storing <b>data</b> in registry file.<br/>"
			+ "<b>\u2022  <font color='gray'>/saveval</font><font color='red'> regkey</font><font color='blue'>*data</font></b>: creates/overwrites <i>Script_<b>regkey</b></i> storing <b>data</b> in registry file.<br/>"
			+ "<b>\u2022  <font color='gray'>/removeval</font><font color='red'> regkey</font></b>: deletes <i>Script_<b>regkey</b></i> in registry file.<br/>"
			+ "<b>\u2022  <font color='gray'>/clearvals</font><font color='red'> regkey</font></b>: deletes all registry values in registry file.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, dataoptionsdisplay, channel);			
		}

		,

		fileoptions: function (src, channel, command){
			var dataoptionsdisplay = border
			+ "<h2>File Options</h2>"
			+ "<br/>"
			+ "<h3>File Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='gray'>/getfilecontent</font><font color='red'> file</font></b>: displays the content of <b>file</b>.<br/>"
			+ "<b>\u2022  <font color='gray'>/printfilecontent</font><font color='red'> file</font></b>: prints the content of <b>file</b>.<br/>"
			+ "<b>\u2022  <font color='gray'>/appendtofile</font><font color='red'> file</font><font color='blue'>*content</font></b>: appends <b>content</b> to <b>file</b>.<br/>"
			+ "<b>\u2022  <font color='gray'>/createfile</font><font color='red'> file</font><font color='blue'>*content</font></b>: creates <b>file</b> storing <b>content</b>.<br/>"
			+ "<b>\u2022  <font color='gray'>/writetofile</font><font color='red'> file</font><font color='blue'>*content</font></b>: creates/overwrites <b>file</b> storing <b>content</b>.<br/>"
			+ "<b>\u2022  <font color='gray'>/deletefile</font><font color='red'> file</font></b>: deletes <b>file</b>.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, dataoptionsdisplay, channel);			
		}

		,

		authoptions: function (src, channel, command){
			helpers.setautharray("mods", 1);
   		helpers.setautharray("admins", 2);
			helpers.setautharray("owners", 3);
			var touradmins = new Array(), tourauthindex;
			for (tourauthindex in tourauth){
				if (members[tourauth[tourauthindex]] !== undefined){
					touradmins.push(members[tourauth[tourauthindex]]);
				}
				else {
					touradmins.push(tourauth[tourauthindex]);
				}
			}
			var authoptionsdisplay = border
			+ "<h2>Authority Options</h2>"
			+ "<br/>"
			+ "<b><font color ='blueviolet'>\u2022  Server Auth level 3 is currently known as " + helpers.escapehtml(AuthLevel3Name).italics() + ".</font><br/>"
			+ "<font color ='#FF6900'>\u2022  Server Auth level 2 is currently known as " + helpers.escapehtml(AuthLevel2Name).italics() + ".</font><br/>"
			+ "<font color='blue'>\u2022  Server Auth level 1 is currently known as " + helpers.escapehtml(AuthLevel1Name).italics() + ".</font><br/>"
			+ "<font color='red'>\u2022  Server Auth level 0 is currently known as " + helpers.escapehtml(AuthLevel0Name).italics() + ".</font><br/>"
 			+ "<font color='green'>\u2022  Server Tournament Auth level 1 is currently known as " + helpers.escapehtml(TourAuthLevel1Name).italics() + ".</font><br/>"
			+ "<font color='maroon'> \u2022  Server Tournament Auth level 0 is currently known as " + helpers.escapehtml(TourAuthLevel0Name).italics() + ".</font><br/>"
 			+ "<font color='indigo'>\u2022  Channel Auth level 3 is currently known as " + helpers.escapehtml(ChannelAuthLevel3Name).italics() + ".</font><br/>"
 			+ "<font color='coral'>\u2022  Channel Auth level 2 is currently known as " + helpers.escapehtml(ChannelAuthLevel2Name).italics() + ".</font><br/>"
 			+ "<font color='royalblue'>\u2022  Channel Auth level 1 is currently known as " + helpers.escapehtml(ChannelAuthLevel1Name).italics() + ".</font><br/>"
 			+ "<font color='crimson'>\u2022  Channel Auth level 0 is currently known as " + helpers.escapehtml(ChannelAuthLevel0Name).italics() + ".</font><br/>"
 			+ "<font color='mediumseagreen'>\u2022  Channel Tournament Auth level 1 is currently known as " + helpers.escapehtml(ChannelTourAuthLevel1Name).italics() + ".</font><br/>"
			+ "<font color='brown'> \u2022  Channel Tournament Auth level 0 is currently known as " + helpers.escapehtml(ChannelTourAuthLevel0Name).italics() + ".</font></b><br/>"
			+ "<br/>"
			+ "<b><font color='blueviolet'>" + AuthLevel3Name + "s</font>: <small>" + String(owners) + "</small></b><br/>"
			+ "<b><font color='#FF6900'>" + AuthLevel2Name + "s</font>: <small>" + String(admins) + "</small></b><br/>"
			+ "<b><font color='blue'>" + AuthLevel1Name + "s</font>: <small>" + String(mods) + "</small></b><br/>"
			+ "<b><font color='green'>" + TourAuthLevel1Name + "s</font>: <small>" + String(touradmins) + "</small></b>"
			+ "<h3>Authority Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/authlevelname</font><font color='red'> old name</font><font color='blue'>*new name</font></b>: changes <b>old name</b> to <b>new name</b>. <b>old name</b> is the name of an auth level and <b>new name</b> is any non-plural text.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel3Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(AuthLevel3Name) + "</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel2Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(AuthLevel2Name) + "</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel1Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(AuthLevel1Name) + "</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(AuthLevel0Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(AuthLevel0Name) + "</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/clearauths</font></b>: clears the server auth list.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(TourAuthLevel1Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(TourAuthLevel1Name) + "</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(TourAuthLevel0Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(TourAuthLevel0Name) + "</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/cleartourauths</font></b>: clears the server tournament auth list.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, authoptionsdisplay , channel);
		}

		,

		floodoptions: function(src, channel, command){
			if (floodtime == "off"){
				var floodcheck = "off";
			}
			else {
				var floodcheck = messageallowance + " messages per " + helpers.converttime(floodtime*1000);
			}
			var floodoptionsdisplay = border
			+ "<h2>Flood Options</h2>"
			+ "<br/>"
			+ "<b><font color='green'>\u2022  The Flood Check limit is currently set to " + floodcheck + ".</font></b><br/>"	
			+ "<h3>Flood Option Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='gray'>/floodcheck</font><font color='red'> number</font><font color='blue'>*time</font><font color='blueviolet'>*unit</font></b>: sets <b>number</b> messages per <b>time</b> <b>unit</b> as allowed limit.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, floodoptionsdisplay, channel);						
		}

		,

		arboptions: function(src, channel, command){
			var arboptionsdisplay = border
			+ "<h2>Arbitration Options</h2>"
			+ "<br/>"
			+ "<h3>Arbitration Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/rangeban</b></font><font color='red'><b> ip-range</b></font>: prevents anyone with <b>ip-range</b> from entering the server.<br/>"
			+ "\u2013 <b>ip range</b> is any valid 32 bit Internet Protocol Address range.<br/>"
			+ "<b>\u2022  <font color='green'>/rangeunban</b></font><font color='red'><b> ip-range</b></font>: re-allows anyone with <b>ip-range</b> to enter the server.<br/>"
			+ "\u2013 <b>ip range</b> is any valid 32 bit Internet Protocol Address range.<br/>"
			+ "<b>\u2022  <font color='green'>/rangebanlist</b></font>: displays the  server's range ban list.<br/>"
			+ "<b>\u2022  <font color='green'>/clearrangebanlist</b></font>: clears the  server's range ban list.<br/>"
			+ "<b>\u2022  <font color='green'>/silentkick</b></font><font color='red'><b> player</b></font>: silent kicks <b>player</b> from the server.<br/>"
			+ "<b> \u2013 player</b> is the name of any player on the server.<br/>"
			+ "<b>\u2022  <font color='green'>/megasilence</font></b>: silences all users below " + AuthLevel3Name + ".<br/>"
			+ "<b>\u2022  <font color='green'>/unsilence</font></b>: removes a mega silence.<br/>"			
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, arboptionsdisplay, channel);			
		}

		,

		channeloptions: function(src, channel, command){
			var channeloptionsdisplay = border
			+ "<h2>Channel Options</h2>"
			+ "<br/>"
			+ "<b><font color='indigo'>\u2022  The Registered Channels maximum limit is currently set to " + registeredchannelslimit + " channels.</font></b><br/>"	
			+ "<h3>Channel Commands</h3>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/clearregchannels</font></b>: clears all registered channels.<br/>"
			+ "<b>\u2022  <font color='green'>/regchannelslimit</font><font color='red'> number</font></b>: sets the maximum limit of registered channels to <b>number</b>.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, channeloptionsdisplay, channel);			
		}

		,

		banoptions: function(src, channel, command){
			var banoptionsdisplay = border 
			+ "<h2> Ban Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/ban</font><font color='red'> player</font></b>: bans <b>player</b> from the server.<br/>"
			+ "\u2013 <b>player</b> is any player with a lower maximum server auth level than yours.<br/>"
			+ "<b>\u2022  <font color='green'>/banbyip</font><font color='red'> ip-address</font></b>: bans last player to use <b>ip-address</b> from the server.<br/>"
			+ "\u2013 <b>ip-address</b> is any valid 32 bit Internet Protocol address.<br/>"
			+ "<b>\u2022  <font color='green'>/unban</font><font color='red'> player</font></b>: unbans <b>player</b> from the server.<br/>"
			+ "\u2013 <b>player</b> is any player on the ban list.<br/>"
			+ "<b>\u2022  <font color='green'>/unbanbyip</font><font color='red'> ip-address</font></b>: unbans last player to use <b>ip-address</b> from the server.<br/>"
			+ "\u2013 <b>ip-address</b> is any valid 32 bit Internet Protocol address.<br/>"
			+ "<b>\u2022  <font color='green'>/banlist</font></b>: displays the server ban list.<br/>"
			+ "<b>\u2022  <font color='green'>/clearbanlist</font></b>: clears the server ban list.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, banoptionsdisplay, channel);		
		}

		,

		supersilenceoptions: function(src, channel, command){
			var supersilenceoptionsdisplay = border 
			+ "<h2> Super Silence Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/supersilence</font></b>: silences all users below " + AuthLevel2Name + ".<br/>"
			+ "<b>\u2022  <font color='green'>/unsilence</font></b>: removes a super silence.<br/>"		
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, supersilenceoptionsdisplay, channel);		
		}

		,

		kickoptions: function(src, channel, command){
			var kickoptionsdisplay = border 
			+ "<h2> Kick Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/kick</font><font color='red'> player</font></b>: kicks <b>player</b> from the server.<br/>"
			+ "\u2013 <b>player</b> is any player with a lower server auth level than yours on the server.<br/>"
			+ "<b>\u2022  <font color='green'>/ipkick</font><font color='red'> ip-address</font></b>: kicks all aliases of <b>ip-address</b> from the server.<br/>"
			+ "\u2013 <b>ip-address</b> is any valid 32 bit Internet Protocol address.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, kickoptionsdisplay, channel);		
		}

		,

		cpoptions: function(src, channel, command){
			var cpoptionsdisplay = border 
			+ "<h2> CP Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/cp</font><font color='red'> player</font></b>: displays a scripted control panel for <b>player</b>.<br/>"
			+ "\u2013 <b>player</b> is any player in the member database.<br/>"
			+ "<b>\u2022  <font color='green'>/getaliases</font><font color='red'> ip-address</font></b>: displays aliases for <b>ip-address</b> if recorded.<br/>"
			+ "\u2013 <b>ip-address</b> is any valid 32 bit Internet Protocol address.<br/>"
			+ "<b>\u2022  <font color='green'>/getips</font><font color='red'> alias</font></b>: displays IP addresses for <b>alias</b> if recorded.<br/>"
			+ "\u2013 <b>alias</b> is any player in the member database.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cpoptionsdisplay, channel);		
		}

		,

		muteoptions: function(src, channel, command){
			var muteoptionsdisplay = border 
			+ "<h2> Mute Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/mute</font><font color='red'> player</font></b>: mutes <b>player</b> on the server.<br/>"
			+ "\u2013 <b>player</b> is any player with a lower server auth level than yours in the members database.<br/>"
			+ "<b>\u2022  <font color='green'>/unmute</font><font color='red'> player</font></b>: unmutes <b>player</b> on the server.<br/>"
			+ "\u2013 <b>player</b> is any player on the server mutelist other than yourself.<br/>"	
			+ "<b>\u2022  <font color='green'>/mutelist</font></b>: displays the server mutelist.<br/>"	
			+ "<b>\u2022  <font color='green'>/clearmutelist</font></b>: clears the server mutelist.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, muteoptionsdisplay, channel);		
		}

		,

		silenceoptions: function(src, channel, command){
			var silenceoptionsdisplay = border 
			+ "<h2> Silence Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/silence</font></b>: silences all users below " + AuthLevel1Name + ".<br/>"
			+ "<b>\u2022  <font color='green'>/unsilence</font></b>: removes a silence.<br/>"	
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, silenceoptionsdisplay, channel);		
		}

		,

		globalmsgoptions: function(src, channel, command){
			var globalmsgoptionsdisplay = border 
			+ "<h2> Global Message Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/wall</font><font color='red'> message</font></b>: sends a message with a border into the chat for all channels.<br/>"
			+ "\u2013 <b>message</b> is any text.<br/>"
			+ "<b>\u2022  <font color='green'>/htmlwall</font><font color='red'> message</font></b>: sends an html message with a border into the chat for all channels.<br/>"
			+ "\u2013 <b>message</b> is any text.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, globalmsgoptionsdisplay, channel);		
		}

		,

		superimpoptions: function(src, channel, command){
			var superimpoptionsdisplay = border 
			+ "<h2> Super Impersonation Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/superimp</font><font color='red'> name</font></b>: changes your displayed username on the server to ~~<b>name</b>~~.<br/>"
			+ " \u2013 <b>name</b> is any text with at most 20 characters.<br/>"
			+ "<b>\u2022  <font color='green'>/superimpoff</font></b>: restores your original name you had before you superimped.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, superimpoptionsdisplay, channel);		
		}

		,

		interactoptions: function(src, channel, command){
			var interactoptionsdisplay = border 
			+ "<h2> Interact Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/idle</font></b>: sets your status to idle on the server.<br/>"
			+ "<b>\u2022  <font color='green'>/goback</font></b>: sets your status to active on the server.<br/>"
			+ "<b>\u2022  <font color='green'>/changetier</font><font color='red'> tier</font></b>: changes your tier to <b>tier</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/changeavatar</font><font color='red'> number</font></b>: changes your avatar to avatar <b>number</b>. <b>number</b> is greater than or equal to 1 and less than or equal to 263. If <b>number</b> is out of this range, the avatar is blank.<br/>"
			+ "<b>\u2022  <font color='green'>/changeinfo</font><font color='red'> html</font></b>: changes your trainer information to <b>html</b>.<br/>"
			+ "<b>\u2022  <font color='green'>/unregister</font></b>: clears the password associated with your name.<br/>"
			+ "<b>\u2022  <font color='green'>/disconnect</font></b>: disconnects you from the server.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, interactoptionsdisplay, channel);		
		}

		,

		infooptions: function(src, channel, command){
			var infooptionsdisplay = border 
			+ "<h2> Information Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/mp</font></b>: displays a scripted control panel with you as the target. (My Panel)<br/>"
			+ "<b>\u2022  <font color='green'>/myaliases</font></b>: displays aliases for your current IP Address if recorded.<br/>"
			+ "<b>\u2022  <font color='green'>/myips</font></b>: displays IP addresses for your current alias if recorded.<br/>"
			+ "<b>\u2022  <font color='green'>/team</font></b>: displays your exported team.<br/>"
			+ "<b>\u2022  <font color='green'>/rankings</font></b> or <b><font color='green'>/rankings</font><font color='red'> player</font></b>: displays  your rank or <b>player</b>'s rank for each tier. <b>player</b> is any player in the members database.<br/>"
			+ "<b>\u2022  <font color='green'>/playersonline</font></b>: displays the players online list.<br/>"
			+ "<b>\u2022  <font color='green'>/battlesonline</font></b>: displays the battles online list.<br/>"
			+ "<b>\u2022  <font color='green'>/channelsonline</font></b>: displays the channels online list.<br/>"
			+ "<b>\u2022  <font color='green'>/auths</font></b>: displays the auth list of the server.<br/>"
			+ "<b>\u2022  <font color='green'>/memorystate</font></b>: displays the server's memory state.<br/>"
			+ "<b>\u2022  <font color='green'>/serverinfo</font></b>: displays server information.<br/>"
			+ "<b>\u2022  <font color='green'>/playerinfo</font></b> or <b><font color='green'>/playerinfo</font><font color='red'> player</font></b>: displays  your or <b>player</b>'s player information. <b>player</b> is any player in the members database.<br/>"
			+ "<b>\u2022  <font color='green'>/sprite</font><font color='red'> Pokémon</font></b> or <b><font color='green'>/sprite</font><font color='red'> Pokémon</font><font color='blue'>*number</font></b>: displays the generation 5 sprite of <b>Pokémon</b> or generation <b>number</b> sprite of <b>Pokémon</b>. <b>Pokémon</b> is a valid Pokémon name and <b>number</b> is a value from 1 to 5.<br/>"
			+ "<b>\u2022  <font color='green'>/scriptinfo</font></b>: displays script information.<br/>"
			+ "<b>\u2022  <font color='green'>/latest</font></b>: displays information on latest implemented features and script changes.<br/>"
			+ "<b>\u2022  <font color='green'>/regchannelslist</font></b>: displays the registered channels list.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, infooptionsdisplay, channel);		
		}

		,

		cchatoptions: function(src, channel, command){
			var cchatoptionsdisplay = border 
			+ "<h2> Channel Chat Options </h2>"
			+ "<br/>"
			+ "<font color='indigo'><b>\u2022  The Channel topic is currently " + helpers.escapehtml(channelsonline[channel].topic).italics() + "</b></font><br/>"
			+ "<font color='red'><b>\u2022  Combining Characters are currently  turned " + channelsonline[channel].combinecharacters + ".</b></font><br/>"
			+ "<font color='blue'><b>\u2022  Reversing Characters are currently  turned " + channelsonline[channel].reversecharacters + ".</b></font><br/>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/temptopic</font><font color='red'> topic</font></b>: changes the channel topic to <b>topic</b> for the duration that the channel is open for. <b>topic</b> is any text. if <b>topic</b> is <i>off</i>, turns the channel topic feature off. If <b>topic</b> is <i>default</i>, changes the channel topic to <i>Welcome to " + sys.channel(channel) + "!</i><br/>"
			+ "<b>\u2022  <font color='green'>/topic</font><font color='red'> topic</font></b>: changes the channel topic of a registered channel to <b>topic</b>. <b>topic</b> is any text. If <b>topic</b> is <i>off</i>, turns the channel topic feature off. If <b>topic</b> is <i>default</i>, changes the channel topic to <i>Welcome to " + sys.channel(channel) + "!</i><br/>"
			+ "<b>\u2022  <font color='green'>/combinechar</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, messages can be sent with combine characters in them (can form zalgo); if <b>status</b> is <i>off</i>, they can't be sent.<br/>"
			+ "<b>\u2022  <font color='green'>/reversechar</font><font color='red'> status</font></b>: if <b>status</b> is <i>on</i>, messages can be sent with reverse characters in them; if <b>status</b> is <i>off</i>, they can't be sent.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cchatoptionsdisplay, channel);		
		}

		,

		cauthoptions: function(src, channel, command){
			var cauth3 = channelsonline[channel].owners, cauth2 = channelsonline[channel].admins, cauth1 = channelsonline[channel].mods, ctourauth = channelsonline[channel].touradmins, authindex, cowners = new Array(), cadmins = new Array(), cmods = new Array(), ctouradmins = new Array();
			for (authindex in cauth3){
				if (members[cauth3[authindex]] !== undefined){
					cowners.push(members[cauth3[authindex]]);
				}
				else {
					cowners.push(cauth3[authindex]);
				}
			}
			for (authindex in cauth2){
				if (members[cauth2[authindex]] !== undefined){
					cadmins.push(members[cauth2[authindex]]);
				}
				else {
					cadmins.push(cauth2[authindex]);
				}
			}
			for (authindex in cauth1){
				if (members[cauth1[authindex]] !== undefined){
					cmods.push(members[cauth1[authindex]]);
				}
				else {
					cmods.push(cauth1[authindex]);
				}
			}
			for (authindex in ctourauth){
				if (members[ctourauth[authindex]] !== undefined){
					ctouradmins.push(members[ctourauth[authindex]]);
				}
				else {
					ctouradmins.push(ctourauth[authindex]);
				}
			}
			var cauthoptionsdisplay = border
			+ "<h2>Channel Authority Options</h2>"
			+ "<br/>"
			+ "<b><font color='indigo'>" + ChannelAuthLevel3Name + "s</font>: <small>" + String(cowners) + "</small></b><br/>"
			+ "<b><font color='coral'>" + ChannelAuthLevel2Name + "s</font>: <small>" + String(cadmins) + "</small></b><br/>"
			+ "<b><font color='royalblue'>" + ChannelAuthLevel1Name + "s</font>: <small>" + String(cmods) + "</small></b><br/>"
			+ "<b><font color='mediumseagreen'>" + ChannelTourAuthLevel1Name + "s</font>: <small>" + String(ctouradmins) + "</small></b>"
			+ "<h3>Channel Authority Option Commands</h3>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel3Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(ChannelAuthLevel3Name) + "</b> for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel2Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(ChannelAuthLevel2Name) + "</b> for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel1Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(ChannelAuthLevel1Name) + "</b> for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelAuthLevel0Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> to <b>" + helpers.escapehtml(ChannelAuthLevel0Name) + "</b> for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/clearcauths</font></b>: clears the channel auth for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelTourAuthLevel1Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> existing in member database to <b>" + helpers.escapehtml(ChannelTourAuthLevel1Name) + "</b> for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/" + helpers.escapehtml(helpers.removespaces(ChannelTourAuthLevel0Name)).toLowerCase() + "</font><font color='red'> player</font></b>: to change the Auth Level of <b>player</b> to <b>" + helpers.escapehtml(ChannelTourAuthLevel0Name) + "</b> for this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/clearctourauths</font></b>: clears the tournament auth for this channel.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cauthoptionsdisplay , channel);
		}

		,

		crunoptions: function(src, channel, command){
			var channelname = sys.channel(channel);
			var stay = channelsonline[channel].stay == "on" ? "on" : "off";
			var registered = channelsregistered[channelname.toLowerCase()] != undefined ? "registered" : "unregistered";
			if (channel == 0){
				stay = "on";
				registered = "registered";
			}			
			var crunoptionsdisplay = border 
			+ "<h2> Channel Run Options </h2>"
			+ "<br/>"
			+ "<b><font color='red'>\u2022  " + channelname + " is currently " + registered + ".</font></b><br/>"	
			+ "<b><font color='green'>\u2022  Stay is currently turned " + stay + " for " + channelname + ".</font></b><br/>"	
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/registerthis</font></b>: registers the channel you use this command on.<br/>"
			+ "<b>\u2022  <font color='green'>/unregisterthis</font></b>: unregisters the channel you use this command on.<br/>"
			+ "<b>\u2022  <font color='green'>/restartthis</font></b>: restarts the channel you use this command on.<br/>"
			+ "<b>\u2022  <font color='green'>/tempstay</font><font color='red'> status</font></b>: changes the stay to <b>status</b> for the duration that the channel is open for. <b>status</b> is either <i>on</i> or <i>off</i>.<br/>"
			+ "<b>\u2022  <font color='green'>/stay</font><font color='red'> status</font></b>: changes the stay to <b>status</b>. <b>status</b> is either <i>on</i> or <i>off</i>.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, crunoptionsdisplay, channel);		
		}

		,

		ckickoptions: function(src, channel, command){
			var cmsgoptionsdisplay = border 
			+ "<h2> Channel Message Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022 <font color='green'>/ckick</font><font color='red'> player</font></b>: kicks <b>player</b> from the channel.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cmsgoptionsdisplay, channel);		
		}

		,

		cmsgoptions: function(src, channel, command){
			var cmsgoptionsdisplay = border 
			+ "<h2> Channel Message Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/html</font><font color='red'> message</font></b>: sends an html message into the chat. <b>message</b> is any text.<br/>"
			+ "<b>\u2022  <font color='green'>/cwall</font><font color='red'> message</font></b>: sends a message with a border into the chat for this channel.<br/>"
			+ "\u2013 <b>message</b> is any text.<br/>"
			+ "<b>\u2022  <font color='green'>/chtmlwall</font><font color='red'> message</font></b>: sends an html message with a border into the chat for this channel.<br/>"
			+ "\u2013 <b>message</b> is any text.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cmsgoptionsdisplay, channel);		
		}

		,

		umsgoptions: function(src, channel, command){
			var srcname = sys.name(src), color = helpers.namecolor(src);
			var umsgoptionsdisplay = border 
			+ "<h2> User Message Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/me</font><font color='red'> message</font></b>: sends <font color='" +  color + "'><b><i>*** " + srcname +  " message</i></b></font> into the main chat. <b>message</b> is any text.<br/>"
			+ "<b>\u2022  <font color='green'>/imp</font><font color='red'> name</font><font color='blue'>*message</font></b>: sends <b><font color='" +  color + "'>name:</font> message <small><i>impersonation by " + srcname + "</i></small></b> into the main chat. <b>name</b> is any text with at most 20 characters. <b>message</b> is any text.<br/>"
			+ "<b>\u2022  <font color='green'>/reverse</font><font color='red'> message</font></b>: sends <b>message</b> in reverse into the chat.<br/>"
			+ "<b>\u2022  <font color='green'>/future</font><font color='red'> time</font><font color='blue'>*unit</font><font color='blueviolet'>*message</font></b>: sends <b>message <small><i>(time unit ago)</i></small></b> as a chat message in <b>time</b> <b>unit</b>. <b>time</b> is any value. <b>unit</b> is either seconds, minutes, hours, days, weeks, months or years. <b>message</b> is any text.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, umsgoptionsdisplay, channel);		
		}

		,

		corridoroptions: function(src, channel, command){
			var ccorridoroptionsdisplay = border 
			+ "<h2> Corridor Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/joinchannel</font><font color='red'> name</font></b>: joins the channel called <b>name</b>.<b>name</b> is any text with at most 20 characters.<br/>"
			+ "<b>\u2022  <font color='green'>/leavechannel</font></b>: exits you from the channel you use this command on.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, ccorridoroptionsdisplay, channel);		
		}

		,

		cinfooptions: function(src, channel, command){
			var cinfooptionsdisplay = border 
			+ "<h2> Channel Information Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/cplayersonline</font></b>: displays the channel's players online list.<br/>"
			+ "<b>\u2022  <font color='green'>/cauths</font></b>: displays the auth list of this channel.<br/>"
			+ "<b>\u2022  <font color='green'>/channelinfo</font></b>: displays channel information.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cinfooptionsdisplay, channel);		
		}

		,

		touroptions: function(src, channel, command){
			var touroptionsdisplay = border 
			+ "<h2> Tournament Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/tour</font><font color='red'> tier</font><font color='blue'>*number</font></b>: starts <b>tier</b> tournament consisting of <b>number</b> players.<b> tier</b> is any of the server's tiers and <b>number</b> is any value greater than 2.<br/>"
			+ "<b>\u2022  <font color='green'>/toursize</font><font color='red'> number</font></b>: alters the tournament size to <b>number</b> during sign-ups.<b> number</b> is any value greater than 2.<br/>"
			+ "<b>\u2022  <font color='green'>/endtour</font></b>: ends the current tournament.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, touroptionsdisplay, channel);		
		}

		,

		tourmatchoptions: function(src, channel, command){
			var tourmatchoptionsdisplay = border 
			+ "<h2> Tournament Match Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/nontourmatch</font><font color='red'> |number|</font> or <font color='green'>/nontourmatch</font><font color='red'> player</font></b>: declares match <b>number</b> or <b>player</b>'s match as a non-tournament match.<b> number</b> is any valid match number and <b>player</b> is any player in that match.<br/>"
			+ "<b>\u2022  <font color='green'>/tourmatch</font><font color='red'> |number|</font> or <font color='green'>/tourmatch</font><font color='red'> player</font></b>: declares match <b>number</b> or </b>player</b>'s match as a tournament match. <b>number</b> is any valid match number and </b>player</b> is any player in that match.<br/>"
			+ "<b>\u2022  <font color='green'>/resetmatch</font><font color='red'> |number|</font> or <font color='green'>/resetmatch</font><font color='red'> player</font></b>: clears the results of match <b>number</b> or <b>player</b>'s match. <b>number</b> is any valid match number and <b>player</b> is any player in that match.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, tourmatchoptionsdisplay, channel);		
		}

		,

		tourplayeroptions: function(src, channel, command){
			var tourplayeroptionsdisplay = border 
			+ "<h2> Tournament Player Options </h2>"
			+ "<br/>"
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/q</font><font color='red'> player</font></b>: declares <b>player</b> the winner of a match or adds <b>player</b>  to the tournament in the sign-up phase.  <b>player</b> is any player in a match or in the members database.<br/>"
			+ "<b>\u2022  <font color='green'>/switch</font><font color='red'> player1</font><font color='blue'>*player2</font></b>: switches tournament spots between: <b>player1</b> and <b>player2</b> - where at least one player must be in the tournament.<br/>"
			+ "<b>\u2022  <font color='green'>/dq</font><font color='red'> player</font></b>: declares <b>player</b> the loser of a match or removes <b>player</b> from the tournament. <b>player</b> is any player registered in the tournament.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, tourplayeroptionsdisplay, channel);		
		}

		,


		tourbattleoptions: function (src, channel, command){
			var readyfortour = channelsonline[channel].ReadyForTour == "on" ? "<font color='green'>on</font>" : "<font color='red'>off</font>";     
			var forcetourbattle = channelsonline[channel].ForceTourBattles == "on" ? "<font color='green'>on</font>" : "<font color='red'>off</font>"; 
			var autostartbattles = channelsonline[channel].AutoStartBattles == "on" ? "<font color='green'>on</font>" : "<font color='red'>off</font>";
			var enforcetourclauses = channelsonline[channel].EnforceTourClauses == "on" ? "<font color='green'>on</font>" : "<font color='red'>off</font>"; 
			var tourbattleoptionsdisplay = border
			+ "<h2>Tournament Battle Options</h2>"
			+ "<br/>"
			+ "\u2022  <b>Ready for Tournament Battles</b> is currently turned <b>" + readyfortour + "</b>.<br/>"
			+ "\u2022  <b>Forcing Tournament Battles</b> is currently turned <b>" + forcetourbattle + "</b>.<br/>"
			+ "\u2022  <b>Auto-starting Battles</b> is currently turned <b>" + autostartbattles + "</b>.<br/>"
			+ "\u2022  <b>Enforcing Tournament Clauses</b> is currently turned <b>" + enforcetourclauses + "</b>.<br/>"
			+ "<h3>Tournament Option Commands</h3>" 
			+ "<br/>" 
			+ typecommands + "<br/>"
			+ "<br/>"
			+ "<b>\u2022  <font color='green'>/readyfortour</font><font color='red'> status</font></b>: Turns ready for tournament battles on/off. Ready for tournament battles prevents players from playing battles between rounds, registering if they are in a battle and starting battles during sign-ups. If <b>status</b> is <i>on</i>, turns it on. If <b>status</b> is <i>off</i>, turns it off.<br/>"    
			+ "<b>\u2022  <font color='green'>/forcetourbattles</font><font color='red'> status</font></b>: Turns the forcing of tournament battles on/off. Forcing tournament battles prevents a tournament player from starting any non-tournament battle when playing a tournament match is requested. If <b>status</b> is <i>on</i>, turns it on. If <b>status</b> is <i>off</i>, turns it off.<br/>"
			+ "<b>\u2022  <font color='green'>/autostartbattles</font><font color='red'> status</font></b>: Turns the auto-starting of tournament battles on/off. Auto-starting battles starts battles at the beginning of each round  between two players facing each other if they are both on the server and in the appropriate tier. If <b>status</b> is <i>on</i>, turns it on. If <b>status</b> is <i>off</i>, turns it off.<br/>"
			+ "<b>\u2022  <font color='green'>/enforcetourclauses</font><font color='red'> status</font></b>: Turns the enforcing of tournament clauses on/off. Enforcing tournament clauses prevents players from setting clauses other than the find battle clauses for the tournament's tier, when forcing tournament battles is on, in their tournament battles. If <b>status</b> is <i>on</i>, turns it on. If <b>status</b> is <i>off</i>, turns it off.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, tourbattleoptionsdisplay, channel);
		} 

		,

		tempservertopic: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].length > 200){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a topic with at most 200 characters.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			servertopic = command[1].toLowerCase() == "default" ? "Enjoy your stay at " + servername + "!" : command[1];
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server topic has been temporarily changed to " + helpers.escapehtml(servertopic).italics() + " by " + srcname + "!</b></font>");
		}

		,

		servertopic: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].length > 200){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a topic with at most 200 characters.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			servertopic = command[1].toLowerCase() == "default" ? "Enjoy your stay at " + servername + "!" : command[1];
			sys.saveVal("Server_Topic", servertopic);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server topic has been changed to " + helpers.escapehtml(servertopic).italics() + " by " + srcname + "!</b></font>");
		}

		,

		quasienglish: function (src, channel, command) {
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src); 
			if (command[1] == "on"){
				if (quasienglish == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn quasi-english characters in names on because it is already turned on.</i>", channel);
					return;
				}
				if (quasienglish  == "off"){
					quasienglish = "on";
					sys.saveVal("Quasi_English", "on");
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>Quasi-english characters in names has been turned on by " + srcname + ".</font></b><br/>" + border3);
					return;
				}
			}
			if (command[1] == "off"){
				if (quasienglish  == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn quasi-english characters in names off because it is already turned off.</i>", channel);
					return;
				}
				if (quasienglish == "on"){
					quasienglish = "off";
					sys.saveVal("Quasi_English", "off");
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>Quasi-english characters in names has been turned off by " + srcname + ".</font></b><br/>" + border3);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel); 
		}

		,

		futurelimit: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var limit = parseInt(command[1]);
			if (isNaN(limit)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a number as the future limit.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			futurelimit = limit;
			sys.saveVal("Future_Limit", limit);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The future limit has been set to " + futurelimit + " by " + srcname + ".</b></font>", 0);				
		}

		,

		writemsgcmd: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var commandname = command[1].toLowerCase();
			if (/\W/.test(commandname)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to create the message command because it contains characters other than A-z, 0-9 and _.</i>", channel);
				return;
			}
			if (command[2].length > 5000){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to create the message command because the html contains more than 5000 characters.</i>", channel);
				return;
			}
			messagecommands[commandname] = command[2];
			sys.saveVal("Commands_Options_MessageCommands", JSON.stringify(messagecommands));
			commands[commandname] = new Function('src', 'channel', 'command', 'sys.sendHtmlMessage(src, "' + border + '<h2>' + command[1].replace(/[a-z]/, String(/[a-z]/.exec(command[1])).toUpperCase()) + '</h2>' + command[2] + '<br/><br/><timestamp/><br/>' + border + '" , channel);');
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The " + command[1] + "  message command has been written by " + srcname + "!</b></font>");
		}

		,

		deletemsgcmd: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var commandname = command[1].toLowerCase();
			if (messagecommands[commandname] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not a message command.</i>", channel);
				return;
			}
			delete commands[commandname];
			delete messagecommands[commandname]
			sys.saveVal("Commands_Options_MessageCommands", JSON.stringify(messagecommands));
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The " + command[1] + "  message command has been deleted by " + srcname + ".</b></font>");				
		}

		,

		clearmsgcmds: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var messagecommandsindex;
			for (messagecommandsindex in messagecommands){
				delete commands[messagecommandsindex];
			}
			messagecommands = new Object();
			sys.saveVal("Commands_Options_MessageCommands", "{}");
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> All message commands have been deleted by " + srcname + ".</b></font>");			
		}

		,

		resetladder: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var tiers = sys.getTierList(), tiersindex, srcname = sys.name(src);
			for (tiersindex in tiers){
				if (command[1].toLowerCase() == tiers[tiersindex].toLowerCase()){
					sys.resetLadder(tiers[tiersindex]);
					sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The " + tiers[tiersindex] + " ladder has been reset by " + srcname + ".</b></font>");		
					return;
				}
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to reset the ladder of " + command[1] + " because the tier does not exist.</i>", channel);
		}

		,

		clearladders: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var tiers = sys.getTierList(), tiersindex, srcname = sys.name(src);
			for (tiersindex in tiers){
				sys.resetLadder(tiers[tiersindex]);	
			}
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> All ladders have been reset by " + srcname + ".</b></font>");	
		}

		,

		exportladders: function(src, channel, command){
			helpers.exportdb("ladder", "Tier", src, channel, command);
		}

		,

		exportmembers: function(src, channel, command){
			helpers.exportdb("member", "Member", src, channel, command);
		}

		,

		changerating: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to change the rating of " + command[1] + " because they do not exist in the member database.</i>", channel);
				return;
			}				
			var tiers = sys.getTierList(), tiersindex;
			for (tiersindex in tiers){
				if (command[2].toLowerCase() == tiers[tiersindex].toLowerCase()){
					var trgttier = tiers[tiersindex];
				}
			}
			if (trgttier === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to change the rating of " + command[1] + " because " + command[2] + " is not a valid name for a tier.</i>", channel);
				return;
			}
			var trgtrating = command[3];
			if (isNaN(trgtrating)){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to change the rating of " + command[1] + " because " + trgtrating + " is not a valid value for a rating.</i>", channel);
				return;
			}
			var srcname = sys.name(src), trgtname = members[command[1].toLowerCase()];
			sys.changeRating(trgtname, trgttier, trgtrating);
			sys.updateRatings();
			sys.sendHtmlAll("<timestamp/><font color='blue violet'><b>The Ladder Rating of " + trgtname +  " has been changed to " + trgtrating + " for the " + trgttier + " tier by " + srcname + ".</b></font>");
				
		}

		,

		clearpass: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to clear the password of " + command[1] + " because they do not exist in the member database.</i>", channel);
				return;
			}
			if (!sys.dbRegistered(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to clear the password of " + command[1] + " because they do not have one set.</i>", channel);
				return;
			}
			var srcname = sys.name(src), trgtname = members[command[1].toLowerCase()];
			sys.clearPass(trgtname);
			sys.sendHtmlAll("<timestamp/><font color='blue violet'><b>" + trgtname +  "'s password has been cleared by " + srcname + ".</b></font>");				
		}

		,

		open: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (open){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot open the server because it is already open to player connections.</i>", channel);
				return;
			}				
			open = true;
			var srcname = sys.name(src);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blue violet'><b> The server has been opened to player connections by " + srcname + ".</b></font><br/>" + border3);
		}

		,

		close: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!open){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot close the server because it is already closed to player connections.</i>", channel);
				return;
			}		
			open = false;
			var srcname = sys.name(src);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blue violet'><b> The server has been closed to player connections by " + srcname + ".</b></font><br/>" + border3);
		}

		,

		public: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src); var config = sys.getFileContent("config"); config = config.replace(/server_private=1/, "server_private=0");
			sys.writeToFile("config", config);
			sys.makeServerPublic(true);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blue violet'><b> The server has been made public by " + srcname + ".</b></font><br/>" + border3);
		}

		,

		private: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src); var config = sys.getFileContent("config"); config = config.replace(/server_private=0/, "server_private=1");
			sys.writeToFile("config", config);
			sys.makeServerPublic(false);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blue violet'><b> The server has been made private by " + srcname + ".</b></font><br/>" + border3);
		}

		,

		disconnectall: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src), playerids = sys.playerIds(), playerid;
			sys.sendHtmlAll(border3 + "<br/><timestamp/><b>" + srcname + " has disconnected all players from the server.</b><br/>" + border3);
			for (playerid in playerids){
				sys.callQuickly("sys.kick(" + playerids[playerid] + ");", 200);
			}
		}

		,

		lockout: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src), playerids = sys.playerIds(), playerid;
			open = false;
			sys.sendHtmlAll(border3 + "<br/><timestamp/><b>" + srcname + " has locked out all players from the server.</b><br/>" + border3);
			for (playerid in playerids){
				sys.callQuickly("sys.kick(" + playerids[playerid] + ");", 200);
			}
		}

		,

		shutdown: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1] === "0" || command[2] === undefined){
				sys.sendHtmlAll(border3 + "<br/><timestamp/><b>The server has shut down.</b><br/>" + border3);		
				sys.callQuickly("sys.shutDown();", 200);
				return;
			}
			var shutdowntime = parseInt(command[1]), shutdownunit = command[2].toLowerCase();
			if (helpers.nottimeunit(shutdownunit)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to shut down the server because you have not specified a valid unit of time.</i>", channel);
				return;
			}
			if (isNaN(shutdowntime)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to shut down the server because you have not specified a valid number of " + command[2] + "</i>.", channel);
				return;
			}
			var shutdownseconds = helpers.converttoseconds(shutdownunit, shutdowntime);
			shutdownunit = helpers.timeplurality(shutdowntime, shutdownunit);
			var shutdownkey = new Date();
			shutdown = shutdownkey;
			var shutdownfunction = function (){
				if (shutdown === shutdownkey){
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b>The server has shut down.</b><br/>" + border3);		
					sys.callQuickly("sys.shutDown();", 200)
				}
			}
			sys.delayedCall(shutdownfunction, shutdownseconds);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>The server will shut down in " + shutdowntime + " " + shutdownunit + ". - " + sys.name(src) + "</b></font><br/>" + border3);
		}

		,

		cancelshutdown: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (shutdown === false){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to cancel the shutdown because there is currently no shutdown taking place.</i>", channel);
				return;
			}
			shutdown = false;
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>The server shutdown has been cancelled by " + sys.name(src) + "</b></font>.<br/>" + border3);
		}

		,

		tiersname: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (/[^A-z]/gi.test(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you can only name your tiers with characters from A-z.</i>", channel);
				return;
			}
			tiersname = command[1];
			sys.saveVal("Tiers_Options_TiersName", tiersname);
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The name of the Server Tiers has been saved as " + tiersname.italics() + " by " + srcname + ".</b></font>");
		}

		,

		tierslinksupdate: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			sys.saveVal("Tiers_Options_TiersLinks", '{"po":"http://pokemonperfect.co.uk/po_tiers.xml","smogon":"http://pokemonperfect.co.uk/smogon_tiers.xml"}');
			tierslinks = sys.getVal("Tiers_Options_TiersLinks");
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The tiers links object has been updated " + "</a> by " + srcname + ".</b></font>");
		}

		,

		tiersload: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Tiers have been loaded from file by " + srcname + "!</b></font>");
			sys.reloadTiers();
		}
			
		,

		tiersimport: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var nexttiers = sys.getFileContent(command[1]);
			if (nexttiers === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " could not be imported.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			sys.saveVal("Tiers_Options_LastTiers", sys.getFileContent("tiers.xml"));
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> A Server Tiers has been imported by " + srcname + "!</b></font>");
			sys.writeToFile("tiers.xml", nexttiers);
			sys.reloadTiers();
		}

		,

		tiersexport: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Tiers have been exported  by " + srcname + "!</b></font>");
			sys.writeToFile(tiersname + ".xml", sys.getFileContent("tiers.xml"));
		}

		,

		tiersinstall: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tierslinks[command[1]] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to install tiers because " + command[1] + " is not a valid key.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			sys.saveVal("Tiers_Options_LastTiers", sys.getFileContent("tiers.xml"));
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The latest " + command[1] + " tiers have been installed by " + srcname + "!</b></font>");
			sys.webCall(tierslinks[command[1]], "if (/category/gi.test(resp)){sys.writeToFile('tiers.xml', resp)}sys.reloadTiers()");	
		}

		,

		tierslast: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var nexttiers = sys.getVal("Tiers_Options_LastTiers");
			if (nexttiers == ""){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to revert because there currently is no last version of the tiers</i>", channel);
				return;
			}
			var srcname = sys.name(src); 
			sys.saveVal("Tiers_Options_LastTiers", sys.getFileContent("tiers.xml"));
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Tiers have been reverted to the last version by " + srcname + "!</b></font>");
			sys.writeToFile("tiers.xml", nexttiers);
			sys.reloadTiers();
		}

		,

		scriptname: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (/[^A-z]/gi.test(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you can only name your script with characters from A-z.</i>", channel);
				return;
			}
			scriptname = command[1];
			sys.saveVal("Script_Options_ScriptName", scriptname);
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The name of the Server Script has been saved as " + scriptname.italics() + " by " + srcname + ".</b></font>");
		}

		,

		scriptupdatelinks: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			sys.saveVal("Script_Options_ServerScriptLink", "http://pokemonperfect.co.uk/serverscript.txt");
			sys.saveVal("Script_Options_AutoUpdateScriptLink", "http://pokemonperfect.co.uk/webcallscript.txt");
			serverscriptlink = sys.getVal("Script_Options_ServerScriptLink");
			autoupdatescriptlink = sys.getVal("Script_Options_AutoUpdateScriptLink");
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The Full Original Script web URL has been saved as <a href='" + serverscriptlink + "'>" + serverscriptlink.italics() + "</a> and the Auto-Update Script web URL has been saved as <a href='" + autoupdatescriptlink + "'>" + autoupdatescriptlink.italics() + "</a> by " + srcname + ".</b></font>");
		}

		,

		scriptserverlink: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].substr(0,7) != "http://"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, the link must begin with <b>http://</b>.</i>", channel);
				return;
			}
			serverscriptlink = command[1];
			sys.saveVal("Script_Options_ServerScriptLink", serverscriptlink);
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The Full Original Script web URL has been saved as <a href='" + serverscriptlink + "'>" + serverscriptlink.italics() + "</a> by " + srcname + ".</b></font>");
		}

		,

		scriptautolink: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].substr(0,7) != "http://"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, the link must begin with <b>http://</b>.</i>", channel);
				return;
			}
			autoupdatescriptlink = command[1];
			sys.saveVal("Script_Options_AutoUpdateScriptLink", autoupdatescriptlink);
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The Auto-Update Script web URL has been saved as <a href='" + autoupdatescriptlink + "'>" + autoupdatescriptlink.italics() + "</a> by " + srcname + ".</b></font>");
		}

		,

		scriptload: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been loaded from file by " + srcname + "!</b></font>");
			sys.changeScript(scriptcontent);
		}

		,

		scriptreload: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been reloaded by " + srcname + "!</b></font>");
			load();
		}
			
		,

		scriptchange: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var nextscript = sys.getFileContent(command[1]);
			if (nextscript === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " could not be loaded.</i>", channel);
				return;
			}
			var srcname = sys.name(src); 
			sys.saveVal("Script_Options_LastScript", scriptcontent);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been changed by " + srcname + "!</b></font>");
			sys.changeScript(nextscript);		
		}
		
		,		

		scriptimport: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var nextscript = sys.getFileContent(command[1]);
			if (nextscript === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " could not be imported.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			sys.saveVal("Script_Options_LastScript", scriptcontent);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> A Server Script has been imported by " + srcname + "!</b></font>");
			sys.writeToFile("scripts.js", nextscript);
			sys.changeScript(nextscript);
		}

		,

		scriptexport: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been exported  by " + srcname + "!</b></font>");
			sys.writeToFile(scriptname + ".txt", scriptcontent);
		}

		,

		scriptfull: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			helpers.serverscriptdownload();
			if (serverscript == ""){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, no full original script is currently saved.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			sys.saveVal("Script_Options_LastScript", scriptcontent);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Full Original Server Script has been imported by " + srcname + "!</b></font>");
			sys.writeToFile("scripts.js", serverscript);
			sys.changeScript(serverscript);
		}

		,

		scriptautoupdate: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			helpers.autoupdatescriptdownload();
			if (autoupdatescript == ""){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, no auto-update script is currently saved.</i>", channel);
				return;
			}
			var srcname = sys.name(src); 
			sys.saveVal("Script_Options_LastScript", scriptcontent);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Auto-Update Script has been imported by " + srcname + "!</b></font>");
			sys.writeToFile("scripts.js", autoupdatescript);
			sys.changeScript(autoupdatescript);
		}

		,
	
		scriptlast: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var nextscript = sys.getVal("Script_Options_LastScript");
			if (nextscript == ""){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to revert because there currently is no last version of the script</i>", channel);
				return;
			}
			var srcname = sys.name(src); 
			sys.saveVal("Script_Options_LastScript", scriptcontent);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been reverted to the last version by " + srcname + "!</b></font>");
			sys.writeToFile("scripts.js", nextscript);
			sys.changeScript(nextscript);
		}

		,

		scriptmod: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (scriptcontent == serverscript || scriptcontent == autoupdatescript){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot declare you modified the script because it is the same as the current Full Original Script.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (scriptmodders.indexOf(srcname.toLowerCase()) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot declare you modified the script again.</i>", channel);
				return;
			}
			scriptmodders.push(srcname.toLowerCase());
			sys.saveVal("Script_Options_ScriptModders", JSON.stringify(scriptmodders));
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been declared modified by " + srcname+ "!</b></font>");
			helpers.scriptversion();
		}

		,

		scriptunmod: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (scriptmodders.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot undeclare the script as a modification because it has not been declared as one yet.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			scriptmodders = new Array();
			sys.saveVal("Script_Options_ScriptModders", JSON.stringify(scriptmodders));
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The Server Script has been undeclared as a modification by " + srcname + "!</b></font>");
			helpers.scriptversion();
		}

		,

		sys: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (sys[command[1]] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to run sys." + command[1] + " because it is not a scripting function.</i>", channel);
				return;
			}
			var srcname = sys.name(src), sysfunction = command[1];
			command.splice(0,2);
			command = command.join("*");
			var sysargs = command.split(","), sysargsindex;
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>" + srcname + " used the following scripting function:</b></font><br/><b> sys." + helpers.escapehtml(sysfunction) + "(" + helpers.escapehtml(String(sysargs)) + ")</b><br/>" + border3);
			try{
				for (sysargsindex in sysargs){
					sysargs[sysargsindex] = eval(sysargs[sysargsindex]);
				}
				sys[sysfunction].apply(null, sysargs);
				sys.sendHtmlAll("<timestamp/><b>Script Check: </b><font color='green'>OK</font>");
			}
			catch(error){ 
				sys.sendHtmlAll("<timestamp/><b>Script Check: </b><font color='red'>" + error + "</font>");
			}
		}

		,

		findbattlemessage: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
   		var srcname = sys.name(src);    
   		if (command[1] == "on"){
				if (findbattlemessage == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn the Find Battle event message on because it is already turned on.</i>", channel);
					return;
				}
				if (findbattlemessage  == "off"){
					findbattlemessage  = "on";
					sys.saveVal("Event_Options_FindBattleMessage", "on");
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>The Find Battle event message has been turned on by " + srcname + ".</font></b><br/>" + border3);
					return;
    			}
   		}
			if (command[1] == "off"){
				if (findbattlemessage == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn the Find Battle event message off because it is already turned off.</i>", channel);
					return;
				}
				if (findbattlemessage== "on"){
					findbattlemessage = "off";
					sys.saveVal("Event_Options_FindBattleMessage", "off");
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>The Find Battle event message has been turned off by " + srcname + ".</font></b><br/>" + border3);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel); 
		}

		,

		eval: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			command.splice(0,1);
			command = command.join("*");
			var srcname = sys.name(src);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>" + srcname + " evaluated/executed the following code:</b></font><br/><b> " + helpers.escapehtml(command) + "</b><br/>" + border3);
			var starttime = new Date();
			try{
				eval(command);
				sys.sendHtmlAll("<timestamp/><b>Script Check: </b><font color='green'>OK</font>");
			}
			catch(error){ 
				sys.sendHtmlAll("<timestamp/><b>Script Check: </b><font color='red'>" + error + "</font>");
			}
			var runtime = new Date() - starttime;
			sys.sendHtmlAll("<timestamp/><b>Eval Runtime:</b> " + runtime + " milliseconds");
		}

		,

		print: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			try { 
				eval("print(" + command[1] + ")");
				sys.sendHtmlMessage(src, border + "<br/><timestamp/><font color='green'><b>" + command[1] + " was successfuly printed on the server window.</b></font><br/>" + border, channel);
			}
			catch(error){
				sys.sendHtmlMessage(src, border + "<br/><timestamp/><font color='red'><b>" + error + "</font><br/>" + border, channel);
			}
		}

		,

		clear: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			sys.clearChat();
			sys.sendHtmlMessage(src, border + "<br/><timestamp/><b><font color='green'>The Server window has been cleared.</font></b><br/>" + border, channel);
		}

		,

		system: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>" + srcname + " ran the system command:</b></font><br/><b> " + command[1] + "</b><br/>" + border3);
			sys.system(command[1]);
		}

		,

		tempvarchanges: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);				
			if (command[1] == "on"){
				if (variablechanges == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn the temporary showing of variable changes on because it is already turned on.</i>", channel);
					return;
				}
				if (variablechanges == "off"){
					variablechanges = "on";
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>The temporary showing of variable changes  has been turned on by " + srcname + ".</font></b><br/>" + border3);
					return;
				}
			}
			if (command[1] == "off"){
				if (variablechanges  == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn the temporary showing of variable changes off because it is already turned off.</i>", channel);
					return;
				}
				if (variablechanges == "on"){
					variablechanges  = "off";
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>The temporary showing of variable changes has been turned off by " + srcname + ".</font></b><br/>" + border3);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel);     
		}

		,

		varchanges: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);				
			if (command[1] == "on"){
				if (variablechanges == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn the showing of variable changes on because it is already turned on.</i>", channel);
					return;
				}
				if (variablechanges == "off"){
					variablechanges = "on";
					sys.saveVal("Variable_Options_VariableChanges", "on");
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>The showing of variable changes  has been turned on by " + srcname + ".</font></b><br/>" + border3);
					return;
				}
			}
			if (command[1] == "off"){
				if (variablechanges  == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn the showing of variable changes off because it is already turned off.</i>", channel);
					return;
				}
				if (variablechanges == "on"){
					variablechanges  = "off";
					sys.saveVal("Variable_Options_VariableChanges", "off");
					sys.sendHtmlAll(border3 + "<br/><timestamp/><b><font color='blueviolet'>The showing of variable changes has been turned off by " + srcname + ".</font></b><br/>" + border3);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel);     
		}

		,

		get: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the content of " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			if (String(globalvariable).length > 5000){
				print(globalvariable);
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, because it was over 5000 characters long, the content was printed on the server window.</i>", channel);	
				return;		
			}
			globalvariable = globalvariable === undefined ? "undefined" : globalvariable; 
			var datatype = typeof globalvariable;
			var getmessage = border
			+ "<h2> Variable Content: " + helpers.escapehtml(command[1]) + " [" + datatype + "]</h2>"
			+ helpers.escapehtml(String(globalvariable)).replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;") + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, getmessage, channel);
		}

		,

		getkeys: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the keys of " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			if (globalvariable === null){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the keys of " + command[1] + " because it contains null.</i>", channel);
				return;
			}
			var datatype = typeof globalvariable;
			if (datatype != "object"){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the keys of " + command[1] + " because it is not an object.</i>", channel);
				return;
			}
			if (String(Object.keys(globalvariable)).length > 5000){
				print(Object.keys(globalvariable));
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, because the keys content was over 5000 characters long, the keys were printed on the server window.</i>", channel);	
				return;		
			}	
			var varlist = "<b><small>", vartotal = Object.keys(globalvariable).length, varindex, colortype = ({"object": "red", "function" : "blue", "number": "blueviolet", "string" : "green", "boolean" : "indigo"}), datatypetotal = new Object();
			for (varindex in globalvariable){
				if (datatypetotal[typeof globalvariable[varindex]] === undefined){
					datatypetotal[typeof globalvariable[varindex]] = 0;
				}
				datatypetotal[typeof globalvariable[varindex]] += 1;
				varlist += "<font color='" + colortype[typeof globalvariable[varindex]] + "'>" + varindex + "</font>" + ", ";
			}
			varlist = varlist.substring(0, varlist.length-2) + ".</small></b>"		
			var getkeysmessage = border
			+ "<h2> Variable Keys: " + helpers.escapehtml(command[1]) + " [object]</h2>"
			+ "<br/>"
			+ varlist + "<br/>"
			+ "<br/>";
			if (datatypetotal.object != undefined){
				getkeysmessage += "<b><font color='red'>Total Number of Object Keys:</font></b> " + datatypetotal.object + "<br/>";
			}
			if (datatypetotal["function"] != undefined){
				getkeysmessage += "<b><font color='blue'>Total Number of Function Keys:</font></b> " + datatypetotal["function"] + "<br/>";
			}
			if (datatypetotal.number != undefined){
				getkeysmessage += "<b><font color='blueviolet'>Total Number of Number Keys:</font></b> " + datatypetotal.number  + "<br/>";
			}
			if (datatypetotal.string != undefined){
				getkeysmessage += "<b><font color='green'>Total Number of String Keys:</font></b> " + datatypetotal.string + "<br/>";
			}
			if (datatypetotal["boolean"] != undefined){
				getkeysmessage += "<b><font color='indigo'>Total Number of Boolean Keys:</font></b> " + datatypetotal["boolean"] + "<br/>";
			}
			getkeysmessage += "<b>Total Number of Keys:</b> " + vartotal + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, getkeysmessage, channel);
		}

		,

		getvalues: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the values of " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			if (globalvariable === null){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the values of " + command[1] + " because it contains null.</i>", channel);
				return;
			}
			var datatype = typeof globalvariable;
			if (datatype != "object"){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the values of " + command[1] + " because it is not an object.</i>", channel);
				return;
			}
			var key, values = new Array(), valuelist = "<b><small>", valuetotal = Object.keys(globalvariable).length, colortype = ({"object": "red", "function" : "blue", "number": "blueviolet", "string" : "green", "boolean" : "indigo"}), datatypetotal = new Object();
			for (key in globalvariable){
				if (datatypetotal[typeof globalvariable[key]] === undefined){
					datatypetotal[typeof globalvariable[key]] = 0;
				}
				datatypetotal[typeof globalvariable[key]] += 1;
				if (globalvariable[key] instanceof Array){
					valuelist += "<font color='" + colortype[typeof globalvariable[key]] + "'>[" + helpers.escapehtml("" + globalvariable[key]) + "]</font>" + ", ";
					values.push("[" + globalvariable[key] + "]");
					continue;
				}			
				valuelist += "<font color='" + colortype[typeof globalvariable[key]] + "'>" + helpers.escapehtml("" + globalvariable[key]) + "</font>" + ", ";
				values.push(globalvariable[key]);
			}
			valuelist = valuelist.substring(0, valuelist.length-2) + ".</small></b>"		
			if (String(values).length > 5000){
				print(values);
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, because the values content was over 5000 characters long, the values were printed on the server window.</i>", channel);	
				return;		
			}	
			var getvaluesmessage = border
			+ "<h2> Variable Values: " + helpers.escapehtml(command[1]) + " [object]</h2>"
			+ "<br/>"
			+ valuelist + "<br/>"
			+ "<br/>";
			if (datatypetotal.object != undefined){
				getvaluesmessage += "<b><font color='red'>Total Number of Object Values:</font></b> " + datatypetotal.object + "<br/>";
			}
			if (datatypetotal["function"] != undefined){
				getvaluesmessage += "<b><font color='blue'>Total Number of Function Values:</font></b> " + datatypetotal["function"] + "<br/>";
			}
			if (datatypetotal.number != undefined){
				getvaluesmessage += "<b><font color='blueviolet'>Total Number of Number Values:</font></b> " + datatypetotal.number  + "<br/>";
			}
			if (datatypetotal.string != undefined){
				getvaluesmessage += "<b><font color='green'>Total Number of String Values:</font></b> " + datatypetotal.string + "<br/>";
			}
			if (datatypetotal["boolean"] != undefined){
				getvaluesmessage += "<b><font color='indigo'>Total Number of Boolean Values:</font></b> " + datatypetotal["boolean"] + "<br/>";
			}
			getvaluesmessage += "<b>Total Number of Values:</b> " + valuetotal + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;		
			sys.sendHtmlMessage(src, getvaluesmessage, channel);
		}

		,

		getmembers: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the members of " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			if (globalvariable === null){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the members of " + command[1] + " because it contains null.</i>", channel);
				return;
			}
			var datatype = typeof globalvariable;
			if (datatype != "object"){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the members of " + command[1] + " because it is not an object.</i>", channel);
				return;
			}
			var key, members = new Array(), memberslist = "<b><small>", memberstotal = Object.keys(globalvariable).length, colortype = ({"object": "red", "function" : "blue", "number": "blueviolet", "string" : "green", "boolean" : "indigo"}), datatypetotal = new Object();
			for (key in globalvariable){
				if (datatypetotal[typeof globalvariable[key]] === undefined){
					datatypetotal[typeof globalvariable[key]] = 0;
				}
				datatypetotal[typeof globalvariable[key]] += 1;
				if (globalvariable[key] instanceof Array){
					memberslist += "<font color='" + colortype[typeof globalvariable[key]] + "'>" + helpers.escapehtml(key + ":[" + globalvariable[key]) + "]</font>" + ", ";
					members.push(key + ": " + "[" + globalvariable[key] + "]");
					continue;
				}			
				memberslist += "<font color='" + colortype[typeof globalvariable[key]] + "'>" + helpers.escapehtml(key + ": " + globalvariable[key]) + "</font>" + ", ";
				members.push(key + ": " + globalvariable[key]);
			}
			memberslist = memberslist.substring(0, memberslist.length-2) + ".</small></b>"		
			if (String(members).length > 5000){
				print(members);
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, because the members content was over 5000 characters long, the values were printed on the server window.</i>", channel);	
				return;		
			}		
			var getmembersmessage = border
			+ "<h2> Variable Members: " + helpers.escapehtml(command[1]) + " [object]</h2>"
			+ "<br/>"
			+ memberslist + "<br/>"
			+ "<br/>";
			if (datatypetotal.object != undefined){
				getmembersmessage += "<b><font color='red'>Total Number of Object Members:</font></b> " + datatypetotal.object + "<br/>";
			}
			if (datatypetotal["function"] != undefined){
				getmembersmessage += "<b><font color='blue'>Total Number of Function Members:</font></b> " + datatypetotal["function"] + "<br/>";
			}
			if (datatypetotal.number != undefined){
				getmembersmessage += "<b><font color='blueviolet'>Total Number of Number Members:</font></b> " + datatypetotal.number  + "<br/>";
			}
			if (datatypetotal.string != undefined){
				getmembersmessage += "<b><font color='green'>Total Number of String Members:</font></b> " + datatypetotal.string + "<br/>";
			}
			if (datatypetotal["boolean"] != undefined){
				getmembersmessage += "<b><font color='indigo'>Total Number of Boolean Members:</font></b> " + datatypetotal["boolean"] + "<br/>";
			}
			getmembersmessage += "<b>Total Number of Members:</b> " + memberstotal + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;		
			sys.sendHtmlMessage(src, getmembersmessage, channel);
		}

		,

		getlength: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the length of " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			var datatype = typeof globalvariable, length;
			if (datatype != "string" && datatype != "object" && datatype != "function"){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the length of " + command[1] + " because it is not a string, object or function.</i>", channel);
				return;
			}
			if (globalvariable === null){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot get the length of " + command[1] + " because it contains null.</i>", channel);
				return;
			}				
			if (datatype === "string" || datatype === "function"){
				length = globalvariable.length;
			}
			if (datatype === "object"){
				length = Object.keys(globalvariable).length;
			}
			var getlengthmessage = border
			+ "<h2> Variable Length: " + helpers.escapehtml(command[1]) + " [" + datatype + "]</h2>"
			+ length + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, getlengthmessage, channel);
		}

		,

		set: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot set " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			var globalkey = command[1];
			command.splice(0,2);
			command = command.join("*");
			if (command === ""){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot save " + globalkey + " because no data has been specified.</i>", channel);
				return;
			}
			if (globalvariable === undefined){
				try{
					eval("global." + globalkey + "=" + command);
				}
				catch(error){
					sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to set " + globalkey + " because the content could not be parsed.</i>", channel);
					return;
				}
				var srcname = sys.name(src);
				if (variablechanges == "on"){
					sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>The global variable: <i>" + globalkey + "</i> was successfully set as <i>" + command + "</i> by " + srcname + "!</b></font><br/>" + border3);
				}
				else {
					sys.sendHtmlMessage(src, border + "<br/><timestamp/><b>The global variable: <i>" + globalkey + "</i> was successfully set as <i>" + command + "</i></b><br/>" + border, channel);					
				}
				return;
			}
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot set " + globalkey + " because it is already set.</i>", channel);											
		}

		,

		save: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var globalvariable;
			try { 
				globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot save " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			var globalkey = command[1];
			command.splice(0,2);
			command = command.join("*");
			if (command === ""){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot save " + globalkey + " because no data has been specified.</i>", channel);
				return;
			}
			try{
				eval("global." + globalkey + "=" + command);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to save " + globalkey + " because the content could not be parsed.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (variablechanges == "on"){
				sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b>The global variable: <i>" + globalkey + "</i> was successfully saved as <i>" + command + "</i> by " + srcname + "!</b></font><br/>" + border3);
			}
			else {
				sys.sendHtmlMessage(src, border + "<br/><timestamp/><b>The global variable: <i>" + globalkey + "</i> was successfully saved as <i>" + command + "</i></b><br/>" + border, channel);					
			}
		}

		,

		'delete': function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			try { 
				var globalvariable = eval("global." + command[1]);
			}
			catch(error){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot delete " + command[1] + " because it is not a valid name for a variable.</i>", channel);
				return;
			}
			eval("delete global." + command[1]);
			if (variablechanges == "on"){
				sys.sendHtmlAll(border3 + "<br/><timestamp/><font color='blueviolet'><b> The global variable: <i>" + command[1] + "</i> was successfully deleted by " + srcname + "!</b></font><br/>" + border3);
			}
			else {
				sys.sendHtmlMessage(src, border + "<br/><timestamp/><b> The global variable: <i>" + command[1] + "</i> was successfully deleted!</b><br/>" + border, channel);
			}			
		}

		,

		authlevelname: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var oldname = command[1].toLowerCase(), newname = command[2].toLowerCase();
			if (newname.length > 20){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a new name with at most 20 characters.</i>", channel);
				return;
			}
			for (var commandsindex in commands){
				if (commandsindex == helpers.removespaces(newname)){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change to " + command[2] + " because it is listed as a command.</i>", channel);
					return;
				}
			}
			var authindex, srcname = sys.name(src);
			for (authindex = 0; authindex < 4; authindex++){
				if ((global["AuthLevel" + authindex + "Name"]).toLowerCase() == oldname){
					commands[helpers.removespaces(newname) + "commands"] = commands[helpers.removespaces(oldname) + "commands"];
					delete commands[helpers.removespaces(oldname) + "commands"];
					commands[helpers.removespaces(newname)] = commands[helpers.removespaces(oldname)];
					delete commands[helpers.removespaces(oldname)];
					sys.saveVal("Authority_Options_AuthLevel" + authindex + "Name", command[2]);
					global["AuthLevel" + authindex + "Name"] = command[2];
					sys.sendHtmlAll("<timestamp/><b><font color='blueviolet'>Server Auth Level " + authindex + "'s name has been saved as " + helpers.escapehtml(command[2]).italics() + " by " + srcname + ".</font></b>", 0);
					return;
				}
				if ((global["ChannelAuthLevel" + authindex + "Name"]).toLowerCase() == oldname){
					commands[helpers.removespaces(newname) + "commands"] = commands[helpers.removespaces(oldname) + "commands"];
					delete commands[helpers.removespaces(oldname) + "commands"];
					commands[helpers.removespaces(newname)] = commands[helpers.removespaces(oldname)];
					delete commands[helpers.removespaces(oldname)];
					sys.saveVal("Authority_Options_ChannelAuthLevel" + authindex + "Name", command[2]);
					global["ChannelAuthLevel" + authindex + "Name"] = command[2];
					sys.sendHtmlAll("<timestamp/><b><font color='blueviolet'>Channel Auth Level " + authindex + "'s name has been saved as " + helpers.escapehtml(command[2]).italics() + " by " + srcname + ".</font></b>", 0);
					return;
				}
				if (authindex > 1){
					continue;
				}
				if ((global["TourAuthLevel" + authindex + "Name"]).toLowerCase() == oldname){
					commands[helpers.removespaces(newname) + "commands"] = commands[helpers.removespaces(oldname) + "commands"];
					delete commands[helpers.removespaces(oldname) + "commands"];
					commands[helpers.removespaces(newname)] = commands[helpers.removespaces(oldname)];
					delete commands[helpers.removespaces(oldname)];
					sys.saveVal("Authority_Options_TourAuthLevel" + authindex + "Name", command[2]);
					global["TourAuthLevel" + authindex + "Name"] = command[2];
					sys.sendHtmlAll("<timestamp/><b><font color='blueviolet'>Tournament Auth Level " + authindex + "'s name has been saved as " + helpers.escapehtml(command[2]).italics() + " by " + srcname + ".</font></b>", 0);
					return;
				}
				if ((global["ChannelTourAuthLevel" + authindex + "Name"]).toLowerCase() == oldname){
					commands[helpers.removespaces(newname) + "commands"] = commands[helpers.removespaces(oldname) + "commands"];
					delete commands[helpers.removespaces(oldname) + "commands"];
					commands[helpers.removespaces(newname)] = commands[helpers.removespaces(oldname)];
					delete commands[helpers.removespaces(oldname)];
					sys.saveVal("Authority_Options_ChannelTourAuthLevel" + authindex + "Name", command[2]);
					global["ChannelTourAuthLevel" + authindex + "Name"] = command[2];
					sys.sendHtmlAll("<timestamp/><b><font color='blueviolet'>Channel Tournament Auth Level " + authindex + "'s name has been saved as " + helpers.escapehtml(command[2]).italics() + " by " + srcname + ".</font></b>", 0);
					return;
				}
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not recognised as an auth level.</i>", channel);			
		}

		,

		clearauths: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var auths = sys.dbAuths(), authsindex, srcname = sys.name(src);
			for (authsindex in auths){
				var playernumber = sys.id(auths[authsindex]);
				if (playernumber === undefined){
					sys.changeDbAuth(auths[authsindex], 0);
				}
				else {
					sys.changeAuth(playernumber, 0);
				}	
			}
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> All Server Auth has been cleared by " + srcname + ".</b></font>");	
		}

		,

		cleartourauths: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			tourauth = new Array();
			sys.saveVal("Authority_Options_TourAuthLevel1List", "[]");
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> All Server Tournament Auth has been cleared by " + srcname + ".</b></font>");	
		}

		,	

		rangeban: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (rangebanexlist[command[1]] != undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " has already been added to the range ban list.</i>", channel);
				return;				
			}
			var iprange = command[1].split(".").join("");
			if (isNaN(parseInt(iprange))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you can only include numerals 0-9.</i>", channel);
				return;
			}
			var banrange = command[1].split(".");
			if (banrange.length > 4){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " contains more than the necessary 4 octets.</i>", channel);
				return;
			}
			for (var banrangeindex in banrange){
				if (banrange[banrangeindex].length < 1 && banrangeindex != banrange.length-1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not  a valid i.p. range because it does not contain a value in each octet.</i>", channel);
					return;
				}
				if (Number(banrange[banrangeindex]) > 255 || Number(banrange[banrangeindex]) < 0 ){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not  a valid i.p. range because it contains non 8 bit values.</i>", channel);
					return;
				}
				if ((banrange[banrangeindex].length == 2 && Number(banrange[banrangeindex]) < 10) || (banrange[banrangeindex].length == 3 && Number(banrange[banrangeindex]) < 100)){
					banrange[banrangeindex] = String(Number(banrange[banrangeindex]));
				}
				if (((banrange[banrangeindex].length == 1 && Number(banrange[banrangeindex]) > 2) || (banrange[banrangeindex].length == 2 && Number(banrange[banrangeindex]) > 25) || (banrange[banrangeindex].length == 3 && banrange.length != 4)) && banrangeindex == banrange.length-1){
					banrange[banrangeindex] += ".";
				}
			}
			command[1] = banrange.join(".");
			rangebanexlist[command[1]] = new Object();
			sys.saveVal("RangeBanEx_List", JSON.stringify(rangebanexlist));
			sys.sendHtmlAll("<font color='blueviolet'><timestamp/><b>The I.P Range: " + command[1] + " has been banned by " + sys.name(src) + ".</b></font>" , channel);
		}

		,

		rangeunban: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var iprange = command[1].split(".").join("");
			if (isNaN(parseInt(iprange))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you can only include numerals 0-9.</i>", channel);
				return;
			}
			var banrange = command[1].split(".");
			if (banrange.length > 4){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " contains more than the necessary 4 octets.</i>", channel);
				return;
			}
			for (var banrangeindex in banrange){
				if (banrange[banrangeindex].length < 1 && banrangeindex != banrange.length-1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not  a valid i.p. range because it does not contain a value in each octet.</i>", channel);
					return;
				}
				if (Number(banrange[banrangeindex]) > 255 || Number(banrange[banrangeindex]) < 0 ){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not  a valid i.p. range because it contains non 8 bit values.</i>", channel);
					return;
				}
				if ((banrange[banrangeindex].length == 2 && Number(banrange[banrangeindex]) < 10) || (banrange[banrangeindex].length == 3 && Number(banrange[banrangeindex]) < 100)){
					banrange[banrangeindex] = String(Number(banrange[banrangeindex]));
				}
				if (((banrange[banrangeindex].length == 1 && Number(banrange[banrangeindex]) > 2) || (banrange[banrangeindex].length == 2 && Number(banrange[banrangeindex]) > 25) || (banrange[banrangeindex].length == 3 && banrange.length != 4)) && banrangeindex == banrange.length-1){
					banrange[banrangeindex] += ".";
				}
			}
			command[1] = banrange.join(".");
			if (rangebanexlist[command[1]] == undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not on the range ban list.</i>", channel);
				return;				
			}
			delete rangebanexlist[command[1]];
			sys.saveVal("RangeBanEx_List", JSON.stringify(rangebanexlist));
			sys.sendHtmlAll("<font color='blueviolet'><timestamp/><b>The I.P Range: " + command[1] + " has been unbanned by " + sys.name(src) + ".</b></font>" , channel);
		}

		,

		rangebanlist: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var rangebanexindex, rangebantable = "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='lavender'><th>I.P. Range</th></tr>";
			for (rangebanexindex in rangebanexlist){
				rangebantable += "<tr bgcolor='lavender'><td>" + rangebanexindex + "</td></tr>";
			}
			rangebantable += "</table>"
			sys.sendHtmlMessage(src, border + "<h2>Range Ban List</h2><br/>" + rangebantable + "<br/><br/>" + border, channel);	
		}

		,

		clearrangebanlist: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (Object.keys(rangebanexlist).length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to clear the range ban list because it is currently empty.</i>", channel);
				return;
			}
			rangebanexlist = new Object();
			sys.saveVal("RangeBanEx_List", "{}");
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>The server range ban list has been cleared by " + sys.name(src) + ".</b></font>", channel);	
		}

		,

		silentkick: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var playernumber = sys.id(command[1]);
			if (playernumber === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not currently on the server.</i>", channel);
				return;
			}
			sys.kick(playernumber);
		}

		,

		megasilence: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (silence == 3){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use mega silence because mega silence is in effect.</i>", channel);
				return;
			}
			silence = 3;
			var srcname = sys.name(src); silencer = srcname;
			var silencemessage = border3 + "<br/>"
			+ "<timestamp/><font color='blueviolet'><b>All players below " + AuthLevel3Name + " have been silenced by " + srcname + ".</b></font><br/>"
			+ border3;
			sys.sendHtmlAll(silencemessage);			
		}

		,

		deleteplayer: function(src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
				return;
			}
			var playername = members[command[1].toLowerCase()], srcname = sys.name(src);
			sys.dbDelete(playername.toLowerCase());
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>" + playername + " has been deleted by " + srcname + " for next start up!</b></font>");
		}

		,

		clearregchannels: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (registeredchannels.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot clear the registered channels list because no channels have been registered.</i>", channel);
				return;
			}
			var registeredchannelsindex, srcname = sys.name(src);
			for (registeredchannelsindex in registeredchannels){
				if (channelsregistered[registeredchannels[registeredchannelsindex]] != undefined){
					delete channelsregistered[registeredchannels[registeredchannelsindex]];
				}
				sys.removeVal("Registered_Channel_" + registeredchannels[registeredchannelsindex]);
			}
			registeredchannels = new Array();
			sys.saveVal("Channel_Options_RegisteredChannels", "[]");
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The registered channels list has been cleared by " + srcname + ".</b></font>", 0);
		}

		,

		regchannelslimit: function (src, channel, command){
			if (sys.auth(src) < 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var limit = parseInt(command[1]);
			if (isNaN(limit)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a number as the registered channels limit.</i>", channel);
				return;
			}
			if (limit < registeredchannels.length){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot specify a limit less than the current number of registered channels: " + registeredchannels.length + "</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			registeredchannelslimit = limit;
			sys.saveVal("Channels_Options_RegisteredChannelsLimit", limit);
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b> The registered channels limit has been set to " + registeredchannelslimit + " by " + srcname + ".</b></font>", 0);				
		}

		,

		ban: function (src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban " + command[1] + " because they do not exist in the member database.</i>", channel);
				return;
			}
			var banlist = sys.banList(), trgtname = members[command[1].toLowerCase()], srcname = sys.name(src);
			if (banlist.indexOf(command[1].toLowerCase()) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban " + trgtname + "  because they are already banned.</i>", channel);
				return;
			}
			if (sys.ip(src) === sys.dbIp(trgtname)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban yourself.</i>", channel);
				return;
			}
			if (sys.auth(src) <= sys.maxAuth(sys.dbIp(trgtname))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban " + trgtname + " because their maximum auth level is not below your current.</i>", channel);
				return;
			}
			helpers.ban(srcname, trgtname);
		}

		,

		banbyip : function(src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var ipdigits = command[1].split(".").join("");
			if (isNaN(parseInt(ipdigits))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban by IP address becauses " + command[1] + " contains characters other than numerals 0-9.</i>", channel);
				return;
			}
			var ip = command[1].split(".");
			if (ip.length != 4){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban by IP Address because " + command[1] + " does not contain the necessary 4 octets.</i>", channel);
				return;
			}
			for (var ipindex in ip){
				if (parseInt(ip[ipindex]) < 0 || parseInt(ip[ipindex]) > 255){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban by IP address because " + command[1] + " contains non 8-bit values.</i>", channel);
					return;
				}
			}
			if (antimemberlist[command[1]] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban by IP address because a name hasn't been recorded for " + command[1] + ".</i>", channel);
				return;
			}
			var banlist = sys.banList(), trgtname = antimemberlist[command[1]], srcname = sys.name(src);
			if (banlist.indexOf(trgtname.toLowerCase()) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban " + trgtname + " by IP address  because they are already banned.</i>", channel);
				return;
			}
			if (sys.ip(src) == command[1] || srcname == trgtname){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban yourself by IP address.</i>", channel);
				return;
			}
			if (sys.auth(src) <= sys.maxAuth(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to ban " + trgtname + " by IP Address because their maximum auth level is not below your current.</i>", channel);
				return;
			}
			helpers.ban(srcname, trgtname, 1);
		}

		,

		unban: function (src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban " + command[1] + " because they do not exist in the member database.</i>", channel);
				return;
			}
			var banlist = sys.banList(), banlistindex, srcname = sys.name(src), trgtname = members[command[1].toLowerCase()];
			if (banlist.indexOf(trgtname.toLowerCase()) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban " + trgtname + " because they are not on the ban list.</i>", channel);
				return;
			}
			sys.unban(trgtname);
			if (banexlist[trgtname] != undefined){
				delete banexlist[trgtname.toLowerCase()];
				sys.saveVal("BanEx_List", JSON.stringify(banexlist));
			}
			var banexlistindex;
			for (banexlistindex in banexlist){
				if (sys.dbIp(banexlistindex) == sys.dbIp(trgtname)){
					delete banexlist[banexlistindex];
					sys.saveVal("BanEx_List", JSON.stringify(banexlist));
				}
			}
			sys.sendHtmlAll("<timestamp/><font color='#FF6900'><b>" + trgtname + " has been unbanned from the server by " + srcname + "!</b></font>");
		}

		,

		unbanbyip: function (src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var ipdigits = command[1].split(".").join("");
			if (isNaN(parseInt(ipdigits))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban by IP address becauses " + command[1] + " contains characters other than numerals 0-9.</i>", channel);
				return;
			}
			var ip = command[1].split(".");
			if (ip.length != 4){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban by IP Address because " + command[1] + " does not contain the necessary 4 octets.</i>", channel);
				return;
			}
			for (var ipindex in ip){
				if (parseInt(ip[ipindex]) < 0 || parseInt(ip[ipindex]) > 255){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban by IP address because " + command[1] + " contains non 8-bit values.</i>", channel);
					return;
				}
			}
			if (antimemberlist[command[1]] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban by IP address because a name hasn't been recorded for " + command[1] + ".</i>", channel);
				return;
			}
			var banlist = sys.banList(), trgtname = antimemberlist[command[1]], srcname = sys.name(src);
			if (banlist.indexOf(trgtname.toLowerCase()) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to unban " + trgtname + " by IP address  because they are not on the banlist.</i>", channel);
				return;
			}
			sys.unban(trgtname);
			if (banexlist[trgtname] != undefined){
				delete banexlist[trgtname.toLowerCase()];
				sys.saveVal("BanEx_List", JSON.stringify(banexlist));
			}
			var banexlistindex;
			for (banexlistindex in banexlist){
				if (sys.dbIp(banexlistindex) == sys.dbIp(trgtname)){
					delete banexlist[banexlistindex];
					sys.saveVal("BanEx_List", JSON.stringify(banexlist));
				}
			}
			sys.sendHtmlAll("<timestamp/><font color='#FF6900'><b>" + trgtname + " has been unbanned by IP address from the server by " + srcname + "!</b></font>");
		}

		,

		banlist: function (src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var banlist = sys.banList(), player, banner;
			if (banlist.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, the Ban List is currently empty.</i>", channel);
				return;
			}
			var bantable = "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='#FF6900'><th>Name</th><th>IP Address</th><th> Banned by </th></tr>"
			for (player in banlist){
				banner = "|Unknown|";
				if (banexlist[banlist[player]] != undefined){
					banner = banexlist[banlist[player]].banner;
				}
				bantable += "<tr bgcolor='#FF6900'><td>" + members[banlist[player]] + "</td><td>" + sys.dbIp(banlist[player]) + "</td><td>" + banner + "</td></tr>";
			}
			bantable += "</table><br/><br/>";
			bantable += "<b> Banned Members: </b> " + banlist.length;
			sys.sendHtmlMessage(src, border + "<h2>Ban List</h2><br/>" + bantable + "<br/><br/><timestamp/><br/><border>" + border, channel);		
		}

		,

		clearbanlist: function(src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var banlist = sys.banList(), player;
			if (banlist.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you cannot clear the banlist because it is currently empty.</i>", channel);
				return;
			}
			banexlist = new Object();
			sys.saveVal("BanEx_List", JSON.stringify(banexlist));
			for (player in banlist){
				sys.unban(banlist[player]);
			}
			sys.sendHtmlAll("<timestamp/><font color='#FF6900'><b>The server ban list has been cleared by " + sys.name(src) + ".</b></font>");	
		}
		
		,

		supersilence: function(src, channel, command){
			if (sys.auth(src) < 2){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (silence == 2){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use super silence because super silence is already in effect.</i>", channel);
				return;
			}
			if (silence == 3 && sys.auth(src) < 3){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use super silence because mega silence is in effect.</i>", channel);
				return;
			}	
			silence = 2;
			var srcname = sys.name(src); silencer = srcname;
			var silencemessage = border3 + "<br/>"
			+ "<timestamp/><font color='#FF6900'><b>All players below " + AuthLevel2Name + " have been silenced by " + srcname + ".</b></font><br/>"
			+ border3;
			sys.sendHtmlAll(silencemessage);			
		}

		,

		kick: function (src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var trgt = sys.id(command[1]);
			if (trgt === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not currently on the server.</i>", channel);
				return;
			}
			if (src == trgt){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to kick yourself.</i>", channel);
				return;
			}
			var trgtname = sys.name(trgt);
			if (sys.auth(src) <= sys.auth(trgt)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to kick " + trgtname + " because their auth level is not below yours.</i>", channel);
				return;
			}
			helpers.kick(src, trgt);
		}

		,

		ipkick: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var ipdigits = command[1].split(".").join("");
			if (isNaN(parseInt(ipdigits))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to kick players of IP address: " + command[1] + " because it contains characters other than numerals 0-9.</i>", channel);
				return;
			}
			var ip = command[1].split(".");
			if (ip.length != 4){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to kick players of IP address:  " + command[1] + " because it does not contain the necessary 4 octets.</i>", channel);
				return;
			}
			for (var ipindex in ip){
				if (parseInt(ip[ipindex]) < 0 || parseInt(ip[ipindex]) > 255){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to kick players of IP address: " + command[1] + " because it contains non 8-bit values.</i>", channel);
					return;
				}
			}
			var srcname = sys.name(src);
			if (sys.dbIp(srcname) == command[1]){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to IP kick yourself.</i>", channel);
				return;
			}
			if (sys.auth(src) <= sys.maxAuth(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to IP kick " + command[1] + " because their maximum auth level is not below your current.</i>", channel);
				return;
			}
			var aliases = sys.aliases(command[1]), aliasesindex, kickedaliases = new Array(), trgt, trgtname;				
			for (aliasesindex in aliases){
				trgt = sys.id(aliases[aliasesindex]);
				if (trgt != undefined){
					trgtname = members[sys.name(trgt).toLowerCase()]
					kickedaliases.push(trgtname);
					sys.callQuickly("sys.kick(" + trgt + ");", 200);			
				}
			}
			if (kickedaliases.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to IP kick " + command[1] + " because they have no logged-in aliases.</i>", channel);
				return;
			}				
			sys.sendHtmlAll("<timestamp/><font color='blue'><b> The following aliases have been IP Kicked by " + srcname + ": " + String(kickedaliases) + ".</b></font>");
		}

		,

		cp: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var playername = members[command[1].toLowerCase()];
			if (playersonline[src] != undefined){
				playersonline[src].commandassist = "cp";
				playersonline[src].cp = playername
			}
			if (members[command[1].toLowerCase()] != undefined){
				var playernumber = sys.id(playername), playerip = sys.dbIp(playername), playerips = helpers.ips(command[1]), aliases = sys.aliases(playerip), aliasesindex, laston = sys.dbLastOn(playername), authlevel = sys.dbAuth(command[1]), registered = sys.dbRegistered(command[1]), banlist = sys.banList(), banstatus = "", mutestatus = "";
				var bandesc = "<b><font color='#FF6900'>*ban</font></b> to ban this player.", mutedesc = "<b><font color='blue'>*mute</font></b> to mute this player. ";
				registered = registered === true ? "<b><font color='green'>Yes</font></b>": "<b><font color='red'>No</font></b>";
				for (aliasesindex in aliases){
					aliases[aliasesindex] = members[aliases[aliasesindex]];
				}
				for (var banlistindex in banlist){
					if (command[1].toLowerCase() == banlist[banlistindex]){
						var bannedplayer = banlist[banlistindex];
					}
				}
				if (playername.toLowerCase() == bannedplayer && playernumber == undefined){
					banstatus = "<font color='red'> [Banned Player] </font>";
					bandesc = "<b><font color='#FF6900'>*unban</font></b> to unban this player.";
				}
				if (helpers.mutecheck(playername)){
					mutestatus = "<font color='blue'> [Muted Player] </font>";
					mutedesc = "<b><font color='blue'>*unmute</font></b> to unmute this player. "
				}
				var cpmessage = border4 + "<br/>" 
				+ border
				+ "<h2>Control Panel" + mutestatus + banstatus + "</h2>"
				+ "<b>Name:</b>" 
				+ helpers.connectstatus(playername) + "<br/>"
				+ "<b>Aliases:</b><br/>"
				+ aliases + "<br/>"
				+ "<b>Authority:</b><br/>" 
				+ "\u2022  " + global["AuthLevel" + authlevel + "Name"] + "<br/>"
				+ "<b>IP Address:</b><br/>"
				+ "\u2022  " + playerip + "<br/>"
				+ "<b>IP Aliases:</b><br/>"
				+ "\u2022  " + String(playerips).replace(/,/g, ", ") + "<br/>"
				+ "<b>Name Registered:</b><br/>"
				+ "\u2022  " + registered + "<br/>"
				+ "<b>Last Appearance:</b><br/>"
				+ "\u2022  " + laston + "<br/><br/>"
				+ "<b>Type:</b> <b><font color='blue'>*kick</font></b> to kick this player." + mutedesc + bandesc + "<br/>"
				+ 	"\u2022 <b><font color='gray'>*tempmute</font></b> to tempmute this player. <b><font color='gray'>*tempban</font></b> to tempban this player.<br/>"
				+ "\u2022 <b><font color='blue'>*ipkick</font></b> to kick all logged-in aliases of this player. <b><font color='blueviolet'>*clearpass</font></b> to clear their password.<br/>"
				+ "\u2022 <b><font color='blue'>**name</font></b> to lookup <b>name</b> in the control panel. <b><font color='blue'>*exit</font></b> to exit the Control Panel.<br/>"
				+ "<br/>"
				+ "<timestamp/><br/>"
				+ border;
				sys.sendHtmlMessage(src, cpmessage, channel);
				return;
			}
			var defined = command[1] + " could not ";
			if (command[1] == "undefined"){
				defined = "you did not specify a name to ";
			}
			var uncpmessage = border4 + "<br/>"
			+ border + "<br/>"
			+ "<timestamp/><i>Sorry, " + defined + " be found in the member database.</i><br/>" 
			+ "<b>Type: <i>**name</i> to lookup <i>name</i> in the control panel; </b><b><i>*exit</i> to exit this mode.</b><br/>"
			+ border;
			sys.sendHtmlMessage(src, uncpmessage, channel);
		}

		,

		getaliases: function (src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var ipdigits = command[1].split(".").join("");
			if (isNaN(parseInt(ipdigits))){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain aliases becauses " + command[1] + " contains characters other than numerals 0-9.</i>", channel);
				return;
			}
			var ip = command[1].split(".");
			if (ip.length != 4){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain aliases because " + command[1] + " does not contain the necessary 4 octets.</i>", channel);
				return;
			}
			for (var ipindex in ip){
				if (parseInt(ip[ipindex]) < 0 || parseInt(ip[ipindex]) > 255){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain aliases because " + command[1] + " contains non 8-bit values.</i>", channel);
					return;
				}
			}
			if (!helpers.ipcheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain aliases because they haven't been recorded for " + command[1] + ".</i>", channel);
				return;
			}
			var aliasesindex, aliases = iplist[command[1]], aliaseslist = new Array();
			for (aliasesindex in aliases){
				aliaseslist[aliasesindex] = members[aliases[aliasesindex]];
			}
			var getaliasesdisplay = border
			+ "<h2> Aliases for " + command[1] + "</h2>"
			+ String(aliaseslist).replace(/,/g, ", ") + "." + "<br/>"
			+ "<br/>"
			+ "<b>Latest Alias:</b> " + antimemberlist[command[1]] + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, getaliasesdisplay, channel);
		}

		,

		getips: function (src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to get IP addresses for " + command[1] + " because they do not exist in the member database.</i>", channel);
				return;
			}
			if (!helpers.aliascheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain IP addresses because they haven't been recorded for " + command[1] + ".</i>", channel);
				return;
			}
			var ipsindex, ips = aliaslist[command[1].toLowerCase()], ipslist = new Array();
			for (ipsindex in ips){
				ipslist[ipsindex] = ips[ipsindex];
			}
			var getipsdisplay = border
			+ "<h2> IP Addresses for " + members[command[1].toLowerCase()] + "</h2>"
			+ String(ipslist).replace(/,/g, ", ") + "<br/>"
			+ "<br/>"
			+ "<b>Latest IP address:</b> " + sys.dbIp(command[1]) + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, getipsdisplay, channel);
		}

		,

		mute: function (src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the member database.</i>", channel);
				return;
			}
			var trgtname = command[1].toLowerCase();
			if (muteexlist[trgtname] != undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is already muted.</i>", channel);		
				return;
			}
			var trgtip = sys.dbIp(command[1]);
			if (sys.ip(src) === sys.dbIp(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to mute yourself.</i>", channel);
				return;
			}
			if (sys.auth(src) <= sys.maxAuth(trgtip)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to mute " + command[1] + " because their maximum auth level is not below your current.</i>", channel);
				return;
			}
			muteexlist[trgtname] = new Object();
			muteexlist[trgtname].ip = trgtip;
			mutedips[trgtip] = true;
			sys.saveVal("MuteEx_List", JSON.stringify(muteexlist));
			sys.sendHtmlAll("<timestamp/><font color='blue'><b>" + members[trgtname] + " has been muted by " + sys.name(src) + ".</b></font>");
		}

		,

		unmute: function (src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var trgtname = command[1].toLowerCase(), srcname = sys.name(src);
			if (!helpers.mutecheck(trgtname)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot unmute " + command[1] + " because they are not muted.</i>", channel);
				return;
			}
			if (srcname.toLowerCase() == trgtname){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot unmute yourself.</i>", channel);
				return;
			}
			if (muteexlist[trgtname] != undefined){
				delete muteexlist[trgtname];
			}
			var trgtip = sys.dbIp(trgtname), muteexindex;
			for (muteexindex in muteexlist){
				if (muteexlist[muteexindex].ip == trgtip){
					delete muteexlist[muteexindex];
				}
			}
			delete mutedips[trgtip];
			sys.saveVal("MuteEx_List", JSON.stringify(muteexlist));
			sys.sendHtmlAll("<timestamp/><font color='blue'><b>" + members[trgtname] + " has been unmuted by " + sys.name(src) + ".</b></font>");		
		}

		,

		mutelist: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var mutetable = "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='sky blue'><th>Name</th><th>Name Status</th><th>I.P.</th><th>I.P. Status</th><th>Muted By</th><th>Reason</th><th>Muted At</th><th>Mute Duration</th><th>Auto-Unmute At</th><th>Time Left</th></tr>", muteexindex;
			for (muteexindex in muteexlist){
				var nameloggedin = sys.id(muteexindex) === undefined ? "<font color='red'><b>Offline</b></font>" : "<font color='green'><b>Online</b></font>";
				var aliases = sys.aliases(muteexlist[muteexindex].ip), aliasesindex, iploggedin = "<font color='red'><b>Offline</b></font>";
				for (aliasesindex in aliases){
					if (sys.id(aliases[aliasesindex]) != undefined){
						iploggedin = "<font color='green'><b>Online</b></font>";
					}
				}
				mutetable += "<tr bgcolor='sky blue'><td>" + muteexindex + "</td><td>" + nameloggedin + "<td>" + muteexlist[muteexindex].ip + "</td><td>" + iploggedin + "</td><td>Unknown</td><td>Unknown</td><td>Unknown</td><td>Indefinite</td><td>Unknown</td><td>Unknown</td></tr>";
			}
			mutetable += "</table>"
			sys.sendHtmlMessage(src, border + "<h2>Mute List</h2><br/>" + mutetable + "<br/><br/>" + border, channel);	
		}

		,

		clearmutelist: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (Object.keys(muteexlist).length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot clear the server mute list because it is currently empty.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (helpers.mutecheck(srcname.toLowerCase())){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot clear the server mute list because you are on it.</i>", channel);
				return;
			}		
			muteexlist = new Object();
			sys.saveVal("MuteEx_List", "{}");
			sys.sendHtmlAll("<timestamp/><font color='blue'><b>The server mute list has been cleared by " + srcname + ".</b></font>");	
		}

		,

		silence: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (silence == 1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use silence because silence is already in effect.</i>", channel);
				return;
			}
			if (silence == 2 && sys.auth(src) < 2){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use silence because super silence is in effect.</i>", channel);
				return;
			}
			if (silence == 3 && sys.auth(src) < 3){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use silence because mega silence is in effect.</i>", channel);
				return;
			}					
			silence = 1;
			var srcname = sys.name(src); silencer = srcname;
			var silencemessage = border3 + "<br/>"
			+ "<timestamp/><font color='blue'><b>All players below " + AuthLevel1Name + " have been silenced by " + srcname + ".</b></font><br/>"
			+ border3;
			sys.sendHtmlAll(silencemessage);			
		}

		,

		unsilence: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (silence == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use un-silence because no silence is in effect.</i>", channel);
				return;				
			}
			if (silence == 2 && sys.auth(src) < 2){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use un-silence because super silence is in effect.</i>", channel);
				return;
			}
			if (silence == 3 && sys.auth(src) < 3){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot use un-silence because mega silence is in effect.</i>", channel);
				return;
			}
			var srcname = sys.name(src), authcolor = (function(authlevel){return ({3: "blueviolet" , 2: "#FF6900" , 1: "blue"	}[authlevel]);}).call(null, silence);
			silence = 0;
			var unsilencemessage = border3 + "<br/>"
			+ "<timestamp/><font color='" + authcolor + "'><b>The server has been unsilenced by " + srcname + ".</b></font><br/>"
			+ border3;
			sys.sendHtmlAll(unsilencemessage);			
			
		}

		,

		wall: function (src, channel, command) {
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			command.splice(0,1);
			command = command.join("*");
			var srcname = sys.name(src), bordermessage1 = border3 + "<br/>", bordermessage2 = "<br/>" + border3, wallmessage = srcname + ": " + command;
			if (sys.auth(src) < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}	
			sys.sendHtmlAll(bordermessage1);
			sys.sendAll(wallmessage);
			sys.sendHtmlAll(bordermessage2);
		}

		,

		htmlwall: function (src, channel, command) { 
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (sys.auth(src) < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}	
			var color = helpers.namecolor(src);
			command.splice(0,1);
			command = command.join("*");
			var htmlwallmessage = border3 + "<br/>"
			+ "<br/>"
			+ "<font color=" + color + "><timestamp />+<b><i>" + srcname + ": </i></b></font>" + command + "<br/>"
			+ "<br/>"
			+ border3;
			sys.sendHtmlAll(htmlwallmessage);
		}

		,

		superimp: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (sys.auth(src) < 3 && command[1] == "Server"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you do not have permission to super-impersonate the Server Host.</i>", channel);
				return;				
			}
			if (command[1].length > 16){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a name with at most 16 characters.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			sys.changeName(src, "~~" + command[1] + "~~");
			sys.sendHtmlAll("<timestamp/><font color='blue'><b>" + srcname + " has super-impersonated " + helpers.escapehtml(command[1]) + "!</b></font>");
		}

		,

		superimpoff: function(src, channel, command){
			if (sys.auth(src) < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src);
			if (!(srcname[0] == "~" && srcname[1] == "~" && srcname[srcname.length-2] == "~" && srcname[srcname.length-1] == "~")){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you can't restore your original name because you aren't superimping.</i>", channel);
				return;
			}
			if (playersonline === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[0] + " does not appear available.</i>", channel);
				return;
			}
			if (playersonline[src] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[0] + " will not be available until you next log on.</i>", channel);
				return;
			}
			if (playersonline[src].name === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[0] + " will not be available until you next log on.</i>", channel);
				return;
			}
			srcname = playersonline[src].name;
			sys.changeName(src, srcname);
			sys.sendHtmlAll("<timestamp/><font color='blue'><b>" + srcname + " has turned superimp off!</b></font>");		
		}

		,

		idle: function (src, channel, command){
			if (sys.away(src)){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to set status to idle because you are already idling.</i>", channel);
				return;
			}
			sys.changeAway(src, true);
		}

		,

		goback: function (src, channel, command){
			if (!sys.away(src)){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to go back because your status is already set to active.</i>", channel);
				return;
			}
			sys.changeAway(src, false);
		}

		,

		changetier: function (src, channel, command){
			var tiers = sys.getTierList(), tiersindex, tier;
			for (tiersindex in tiers){
				if (tiers[tiersindex].toLowerCase() == command[1].toLowerCase()){
					tier = tiers[tiersindex];
				}
			}
			if (tier === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to change tiers because " + command[1] + " does not exist as a tier.</i>", channel);
				return;				
			}
			if (!sys.hasLegalTeamForTier(src, tier)){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, your team isn't valid for " + tier + ".</i>", channel);
				return;				
			}
			sys.changeTier(src, tier);
			var changetiermessage = border + "<br/>"
			+ "<timestamp/><b> Your tier was successfully changed to " + tier + "!</b><br/>"
			+ border;
			sys.sendHtmlMessage(src, changetiermessage, channel);
		}

		,

		changeavatar: function (src, channel, command){
			sys.changeAvatar(src, command[1]);
			var changeavatarmessage = border + "<br/>"
			+ "<timestamp/><b> Your avatar was successfully changed to <img src='Themes/Classic/Trainer Sprites/" + command[1] + ".png'></b><br/>"
			+ border;
			sys.sendHtmlMessage(src, changeavatarmessage, channel);
		}

		,

		changeinfo: function (src, channel, command){
			sys.changeInfo(src, command[1]);
			var changeinfomessage = border + "<br/>"
			+ "<timestamp/><b> Your trainer information was successfully changed to:</b><br/>"
			+ helpers.escapehtml(command[1]) + "<br/>"
			+ border;
			sys.sendHtmlMessage(src, changeinfomessage, channel);
		}

		,

		unregister: function (src, channel, command){
			var srcname = sys.name(src);
			if (!sys.dbRegistered(srcname)){
				sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, you are unable to clear your password because you do not have one set.</i>", channel);
				return;
			}
			sys.clearPass(srcname);
			sys.sendHtmlMessage(src, border + "<br/><timestamp/><b> The password for your name has successfully been cleared!</b><br/>" + border, channel);
		}

		,

		disconnect: function(src, channel, command){
			sys.kick(src);
		}

		,

		mp: function(src, channel, command){
			var srcip = sys.ip(src), srcname = sys.name(src), srcips = helpers.ips(srcname), aliases = sys.aliases(srcip), aliasesindex, authlevel = sys.dbAuth(srcname), registered = sys.dbRegistered(srcname), mutestatus = "";
			registered = registered === true ? "<b><font color='green'>Yes</font></b>": "<b><font color='red'>No</font></b>";
			for (aliasesindex in aliases){
				aliases[aliasesindex] = members[aliases[aliasesindex]];
			}
			if (helpers.mutecheck(srcname)){
				mutestatus = "<font color='blue'> [Muted] </font>";
			}
			var mpmessage = border
			+ "<h2>My Panel" + mutestatus + "</h2>"
			+ "<b>Name:</b>" 
			+ helpers.connectstatus(srcname) + "<br/>"
			+ "<b>Aliases:</b><br/>"
			+ aliases + "<br/>"
			+ "<b>Authority:</b><br/>" 
			+ "\u2022 " + global["AuthLevel" + authlevel + "Name"] + "<br/>"
			+ "<b>IP Address:</b><br/>"
			+ "\u2022 " + srcip + "<br/>"
			+ "<b>IP Aliases:</b><br/>"
			+ "\u2022 " + String(srcips).replace(/,/g, ", ") + "<br/>"
			+ "<b>Name Registered:</b><br/>"
			+ "\u2022 " + registered + "<br/>"
			+ "<br/>"
			+ "<b>Type:</b> <b><font color='red'>/disconnect</font></b> to disconnect yourself.<b><font color='red'> /unregister</font></b> to clear your password.<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, mpmessage, channel);
		}

		,

		myaliases: function (src, channel, command){
			var srcip = sys.ip(src);
			if (!helpers.ipcheck(srcip)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain any aliases because they haven't been recorded for your IP address.</i>", channel);
				return;
			}
			var aliasesindex, aliases = iplist[srcip], aliaseslist = new Array();
			for (aliasesindex in aliases){
				aliaseslist[aliasesindex] = members[aliases[aliasesindex]];
			}
			var myaliasesdisplay = border
			+ "<h2>My Aliases</h2>"
			+ String(aliaseslist).replace(/,/g, ", ") + "." + "<br/>"
			+ "<br/>"
			+ "<b>Latest Alias:</b> " + antimemberlist[srcip] + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, myaliasesdisplay, channel);
		}

		,

		myips: function (src, channel, command){
			var srcname = sys.name(src);
			if (!helpers.aliascheck(srcname)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to obtain IP addresses for your alias because they haven't been recorded.</i>", channel);
				return;
			}
			var ipsindex, ips = aliaslist[srcname.toLowerCase()], ipslist = new Array();
			for (ipsindex in ips){
				ipslist[ipsindex] = ips[ipsindex];
			}
			var myipsdisplay = border
			+ "<h2> My IP Addresses</h2>"
			+ String(ipslist).replace(/,/g, ", ") + "<br/>"
			+ "<br/>"
			+ "<b>Latest IP address:</b> " + sys.ip(src) + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, myipsdisplay, channel);
		}

		,

		team: function(src, channel, command){
			helpers.exportteam(src, src, channel);
		}

		,

		rankings: function (src, channel, command){
			var playername;
			if (command[1] === "undefined"){
				playername = sys.name(src);
			}
			else {
				if (!helpers.memberscheck(command[1])){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
					return;				
				}
				playername = members[command[1].toLowerCase()];
			}
			var rankingsmessage = border
			+ "<h2>Rankings of " + playername + "</h2>"
			+ "<br/>"
			+ "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='aquamarine'><th>Tier</th><th>Ranking</th><th>Out Of</th><th>Rating</th><th>No. of Battles</th></tr>"; 
			var tiers = sys.getTierList();
			for (var tiersindex in tiers){
				var ranking = sys.ranking(playername, tiers[tiersindex]);
				ranking = isNaN(ranking) ? "unranked" : ranking
				var rating = sys.id(playername) != undefined ? sys.ladderRating(sys.id(playername), tiers[tiersindex]) : "Cannot be determined";
				rankingsmessage+= "<tr bgcolor='aquamarine'><td>" + tiers[tiersindex] + "</td><td>" + ranking + "</td><td>" + sys.totalPlayersByTier(tiers[tiersindex]) + "</td><td>" + rating + "</td><td>" + sys.ratedBattles(playername, tiers[tiersindex]) + "</td></tr>"
			}
			rankingsmessage += "</table><br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, rankingsmessage, channel);
		}

		,

		playersonline: function (src, channel, command){
			var playersonline = sys.playerIds(), playersonlineindex;
			var playersmessage = border
			+ "<h2>Players Online</h2>";
			for (playersonlineindex in playersonline){
				var playername = members[sys.name(playersonline[playersonlineindex]).toLowerCase()];
				playersmessage += helpers.connectstatus(playername);
			}
			playersmessage += "<br/>"
			+ "<br/>"
			+ "<b>Total Players Online: </b>" + playersonline.length + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, playersmessage, channel);
		}

		,

		battlesonline: function (src, channel, command){
			var battle;
			var battlesmessage = border
			+ "<h2>Battles Online</h2>"
			+ "<br/>"
			+ "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='MediumSlateBlue'><th>Battle Number</th><th>Tier</th><th>Runtime</th><th>Player 1</th><th>Player 2</th></tr>";
			for (battle in battlesonline){
				var battleruntime = helpers.converttime(new Date() - battlesonline[battle].starttime);
				battlesmessage += "<tr bgcolor='MediumSlateBlue'><td>" + battle + "</td><td>" + battlesonline[battle].tier + "</td><td>" + battleruntime + "</td><td>" + sys.name(battlesonline[battle].p1) + "</td><td>" + sys.name(battlesonline[battle].p2) + "</td></tr>";
			}
			battlesmessage += "</table><br/>"
			+ "<br/>"
			+ "<b>Total Battles Online: </b>" + Object.keys(battlesonline).length + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, battlesmessage, channel);			
		}

		,

		channelsonline: function (src, channel, command){
			var channelsonline = sys.channelIds(), channelsonlineindex;
			var channelsmessage = border
			+ "<h2>Channels Online</h2>"
			+ "<br/>"
			+ "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='beige'><th>Channel Number</th><th>Channel Name</th><th>Number of Players</th></tr>";
			for (channelsonlineindex in channelsonline){
				var channelname = sys.channel(channelsonline[channelsonlineindex]), channelplayernum = sys.playersOfChannel(channelsonline[channelsonlineindex]).length;
				channelsmessage += "<tr bgcolor='beige'><td>" + channelsonline[channelsonlineindex] + "</td><td>" + channelname + "</td><td>" + channelplayernum + "</td></tr>";
			}
			channelsmessage += "</table><br/>"
			+ "<br/>"
			+ "<b>Total Channels Online: </b>" + channelsonline.length + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, channelsmessage, channel);				
		}

		,

		auths: function (src, channel, command){
			helpers.setautharray("mods", 1);
			helpers.setautharray("admins", 2);
			helpers.setautharray("owners", 3);
			if (owners.length + admins.length + mods.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, there is currently no server auth.</i>", channel);
				return;
			}
			var authlist = helpers.authlistdisplay("owners", 3, "blueviolet");
			authlist += helpers.authlistdisplay("admins", 2, "#FF6900");
			authlist += helpers.authlistdisplay("mods", 1, "blue");
			var authmembers = sys.dbAuths();
			authmembers = authmembers.length;
			sys.sendHtmlMessage(src, border + "<h2>Server Auth List</h2>" + authlist + "<br/><b>Total Auth Members: </b>" + authmembers + "<br/><br/><timestamp/><br/>" + border, channel);
		}

		,

		memorystate: function (src, channel, command){
			var memorystatedisplay = border 
			+ "<h2>Memory State</h2>"
			+ "<br/>"
			+ sys.memoryDump().replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;") + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, memorystatedisplay, channel);
		}

		,

		serverinfo: function(src, channel, command){
			var config = sys.getFileContent("config").split("\n"), configindex, playerlimit= "unknown", playerlimitregexp = new RegExp("server_maxplayers", "gi"), channelcount = helpers.channelcount(), begintime = "Unknown" , runtime = "Unknown", localtime = new Date();
			if (global.starttime != undefined){
				runtime = new Date() - starttime;
				runtime = helpers.converttime(runtime);
				begintime = starttime;
			}
			for (configindex in config){
				if (playerlimitregexp.test(config[configindex]) == true){
					playerlimit = config[configindex].substr(18);
				}		
			}
			var serverinfo = border
			+ "<h2>Server Info</h2>"
			+ "<h3><u>General</u></h3>"
			+ "<b>Server Name: </b>" + servername + " <small><b>Version:</b> " + serverversion + "</small><br/>" 
			+ "<b> Server Port: </b>" + port + "<br/>"
			+ "<b> Server Status: </b>" + status + " <small><b>Player Limit:</b> " + playerlimit + "</small>"
			+ "<font color='red'><h3><u>Players</u></h3></font>"
			+ "<font color='red'><b>Total Members: </b></font>" + (Object.keys(members).length) + "<br/>"
			+ "<font color='red'><b>Record Number of Players Online: </b></font>" + Number(playerrecord) +  "<br/>"
			+ "<font color='red'><b>Current Number of Players Online: </b></font>" + sys.numPlayers()
			+ "<font color='indigo'><h3><u>Battles</u></h3></font>"
			+ "<font color='indigo'><b>Total Number of Battles Registered: </b></font>" + totalbattles + "<br/>"
			+ "<font color='indigo'><b>Record Number of Battles Hosted: </b></font>" + battlerecord + "<br/>"
			+ "<font color='indigo'><b>Current Number of Battles Hosted: </b></font>" + (battlers.length/2)
			+ "<font color='blue'><h3><u>Channels</u></h3></font>"
			+ "<font color='blue'><b>Total Number of Channels Registered: </b></font>" + registeredchannels.length + "<br/>"
			+ "<font color='blue'><b>Record Number of Channels Hosted: </b></font>" + channelrecord + "<br/>"
			+ "<font color='blue'><b>Current Number of Channels Hosted: </b></font>" + channelcount
			+ "<font color='blue violet'><h3><u>Time</u></h3></font>"
			+ "<font color='blue violet'><b>Server Start Time: </b></font>" + begintime + "<br/>"
			+ "<font color='blue violet'><b>Server Local Time: </b></font>" + localtime + "<br/>"
			+ "<font color='blue violet'><b>Server Run Time: </b></font>" + runtime + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, serverinfo, channel);
		}
		
		,

		playerinfo: function(src, channel, command){
			var playername;
			if (command[1] === "undefined"){
				playername = sys.name(src);
			}
			else {
				if (!helpers.memberscheck(command[1])){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the member database.</i>", channel);
					return;
				}
				playername = members[command[1].toLowerCase()];
			}
			var playernumber = sys.id(playername);
			if (playernumber === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + playername + " is currently not on the server.</i>", channel);
				return;
			}
			var playeravatar = "<img src='Themes/Classic/Trainer Sprites/" + sys.avatar(playernumber) + ".png'>", playerruntime = helpers.converttime(new Date() - playersonline[playernumber].starttime);
			var rating = sys.ladderEnabled(playernumber) ? sys.ladderRating(playernumber) : "Unknown";
			var playerinfo = border
			+ "<h2>Player Information for " + playername + "</h2>"
			+ "<b>Name: </b>"
			+ helpers.connectstatus(playername) + "<br/>"
			+ "<b>Avatar: </b><br/>" 
			+ playeravatar + "<br/>"
			+ "<b>Tier: </b>" + sys.tier(playernumber)+ " <b>Rating: </b>" + rating + "<br/>"
			+ "<b>Info: </b><br/>"
			+ helpers.escapehtml(sys.info(playernumber)) + "<br/>"
			+ "<b>Session Time: </b>" + playerruntime + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, playerinfo, channel);
		}
		
		,

		sprite: function(src, channel, command){
			var pokemonname = command[1], gen = parseInt(command[2]), id = sys.pokeNum(pokemonname);
			if (id === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a valid Pokémon name.</i>", channel);
				return;				
			}
			if (command[2] === undefined){
				gen = 5;
			}
			if (isNaN(gen)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a number for the generation.</i>", channel);
				return;
			}
			if (gen < 1 || gen > 5){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a number greater than or equal to one and less than or equal to 5.</i>", channel);
				return;
			}
			pokemonname = sys.pokemon(id);
			var spritemessage = border
			+ "<h2>" + pokemonname + "'s Gen " + gen + " Sprite</h2>"
			+ "<br/>"
			+ "<img src='pokemon:num=" + id + "&gen=" + gen + "'/><br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, spritemessage, channel);
		}

		,

		scriptinfo: function(src, channel, command){
			var contributorslist = String(scriptcontributors).replace(/,/g, ", "), thankedlist = String(scriptthanked).replace(/,/g, ", ");
			var scriptinfo = border
			+ "<h2> Script Info</h2>"
			+ "<font size='4'><b>Script Name: </b>" + scriptname + "</font><br/>"
			+ "<font size='4'><b>Script Version: </b> 001.9(Bulbasaur learns Vine Whip)</font><br/>"
			+ "<font size='4'><b>Script Length: </b>" + scriptcontent.split(/\u000A/g).length + " lines, " + scriptcontent.length + " characters.</font><br/>"
			+ "<font size='4'><b>Script Registered Date: </b>" + registereddate + "</font><br/>"
			+ "<font size='4'><b>Last Script Load: </b>" + scriptlastload + "</font><br/>"
			+ "<b><big><font color='darkviolet'>Repository @ Github:</font></big></b> <a href='https://github.com/Jakilutra/Lutra-s-Pokemon-Online-Server-Script'>https://github.com/Jakilutra/Lutra-s-Pokemon-Online-Server-Script</a><br/>"
			+ "<b><big><font color='blue'>Full Original Script \u00A9 Lutra: </font></big></b> <a href='" + serverscriptlink + "'>" + serverscriptlink + "</a><br/>"
			+ "<b><font color='green'>Auto-Update Script \u00A9 Lutra:</font></b> <a href='" + autoupdatescriptlink + "'>" + autoupdatescriptlink + "</a><br/>"
			+ "<br/>"
			+ "<font color='indigo'><b>The above text files are copyright under version 2.5 creative commmons attribution-noncommercial-sharealike license.</b><br/>"
			+ "<b><i>Persons can use and modify them but not claim them as their own, and by extension, sell them.</i></b></font><br/>"
			+ "<br/>"
			+ "<font color='goldenrod'><b>Contributors:</b></font> " + contributorslist + "<br/>"
			+ "<font color='darkgoldenrod'><b>Special Thanks:</b></font> " +  thankedlist + "<br/>"
			+ "<b>Additional Thanks:</b> All the server hosts that use and recommend this script; all the users who discuss it: give feedback and request features for it.<br/>"
			+ "<br/>"
			+ scriptversion + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, scriptinfo, channel);
		}

		,

		latest: function(src, channel, command){
			var latest = border
			+ "<h2> Latest Features in the Script </h2>"
			+ "<br/>"
			+ "<table border='3' cellspacing='0' cellpadding='5'>"
			+ "<tr><th>Bulbasaur Version Feature</th><th>Done?</th></tr>"
			+ "<tr><td>Tournaments and tournament auth per channel.</td><td>Yes</td></tr>"
			+ "<tr><td>Server Auth show up on /cauths and can only be given channel auth higher than their corresponding server auth.</td><td>No</td></tr>"
			+ "<tr><td>/ckick command.</td><td>Yes</td></tr>"
			+ "<tr><td>/stats - gets information on wins, losses and win ratio for each unique team.</td><td>No</td></tr>"
			+ "</table>"
			+ "<h3> Changelogs - From 001.7 to 001.9</h3>"
			+ "\u2022 <b><font color='green'>ADDED</font></b> /changetier, /changeavatar, /changeinfo, /disconnectall, /lockout, /clearauths, /cleartourauths, /clearcauths, /clearctourauths, /reverse, /sysoptions, /eventoptions, /sessionoptions, /tiersoptions, beforeFindBattle, afterFindBattle, /sys, /deleteplayer, /findbattlemessage, /tiersname, /tiersimport, /tiersexport, /tiersload, /tiersinstall , /tierslast, /tierslinksupdate, helpers.nottimeunit, /quasienglish, /playerinfo, /futurelimit, /sprite, /reversechar, /combinechar<br/>"
			+ "\u2022 <b><font color='blue'>IMPROVED</font></b>  /ownercommands, /authoptions, /cauthoptions, /scriptoptions, /execoptions, /shutdown, /cancelshutdown, helpers.loadteam, helpers.configload, helpers.connectstatus, helpers.converttoseconds, /eval,  /getkeys, /getvalues, /getmembers, /getlength, /set, /save, /chtmlwall, /cwall, /html, /wall, /htmlwall, /serverinfo, /scriptlast, /scriptupdatelinks, /rankings, afterLogIn, /future<br/>"
			+ "\u2022 <b><font color='purple'>MERGED</font></b> /connectoptions into /runoptions<br/>"
			+ "\u2022 <b><font color='red'>REMOVED</font></b> /setpa, /unsetpa<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, latest, channel);
		}

		,

		regchannelslist: function(src, channel, command){
			var registeredchannelsindex;
			var regchannelslistmessage = border
			+ "<h2>Registered Channels List</h2>"
			+ "<br/>"
			+ "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='beige'><th>Channel Name</th><th>Status</th></tr>";
			for (registeredchannelsindex in registeredchannels){
				var status = sys.existChannel(registeredchannels[registeredchannelsindex]) == true ? "<font color='green'><b> Online </b></font>" : "<font color='red'><b> Offline </b></font>";
				regchannelslistmessage += "<tr bgcolor='beige'><td>" + registeredchannels[registeredchannelsindex] + "</td><td>" + status + "</td></tr>";
			}
			regchannelslistmessage += "</table><br/>"
			+ "<br/>"
			+ "<b>Total Registered Channels: </b>" + registeredchannels.length + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, regchannelslistmessage, channel);
			
		}

		,

		tourauths: function (src, channel, command){
			if (tourauth.length == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, there is currently no tournament auth.</i>", channel);
				return;
			}
			var tourauthindex, tourauthlist = "";
			for (tourauthindex in tourauth){
				if (members[tourauth[tourauthindex]] !== undefined){
					tourauthlist += helpers.connectstatus(members[tourauth[tourauthindex]]);
				}
				else {
					tourauthlist += helpers.connectstatus(tourauth[tourauthindex]);
				}
			}
			var tourauthsmessage = border 
			+ "<h2>Server Tournament Auth List</h2>"
			+ "<font color='green' size=4>" + TourAuthLevel1Name + "s:</font>"
			+ tourauthlist + "<br/>"
			+ "<br/>" 
			+ "<b>Total Auth Members: </b>" + (tourauth.length) + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, tourauthsmessage, channel);
		}

		,

		tours: function (src, channel, command){
			var tourindex, tourstable = "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='chocolate'><th>Channel</th><th>Tier</th><th>Tournament Size</th><th>Phase</th><th>Current Size</th><th>Runtime</th></tr>";
			for (tourindex in tour){
				var channelname = sys.channel(tourindex), minutesago = Math.floor((new Date() - tour[tourindex].tourstarttime)/60000), minutesstring = minutesago == 1 ? "minute" : "minutes", minutesagostring = minutesago == 0 ? "0 minutes" : String(minutesago) + " " + minutesstring;
				if (tour[tourindex].tourmode == 1){
					tourstable += "<tr bgcolor='chocolate'><td>" + channelname + "</td><td>" + tour[tourindex].tourtier + "</td><td>" + tour[tourindex].tournumber + "</td><td>Sign-up</td><td>" + tour[tourindex].tourmembers.length + "</td><td>" + minutesagostring + "</tr>";
				}
				if (tour[tourindex].tourmode == 2){
					var finalroundcheck = tour[tourindex].tourcurrentnumber == 2 ? "Final Round" : "Round " + tour[tourindex].roundnumber;
					tourstable += "<tr bgcolor='chocolate'><td>" + channelname + "</td><td>" + tour[tourindex].tourtier + "</td><td>" + tour[tourindex].tournumber + "</td><td>" + finalroundcheck + "</td><td>" + tour[tourindex].tourcurrentnumber + "</td><td>" + minutesagostring + "</td></tr>";
				}
			}
			tourstable += "</table>";
			if (tourstable === "<table border='3' cellspacing='0' cellpadding='5'><tr bgcolor='chocolate'><th>Channel</th><th>Tier</th><th>Tournament Size</th><th>Phase</th><th>Current Size</th></tr></table>"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, no tournaments are currently running on the server.</i>", channel);
				return;
			}
			var toursmessage = border
			+ "<h2>Current Tournaments</h2>"
			+ "<br/>"
			+ tourstable + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, toursmessage, channel);
		}

		,

		temptopic: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].length > 200){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a topic with at most 200 characters.</i>", channel);
				return;
			}
			channelsonline[channel].topic = command[1].toLowerCase() == "default" ? "Welcome to " + channelname + "!" : command[1];
			sys.sendHtmlAll("<timestamp/><font color='Indigo'><b> The Channel topic has been temporarily changed to " + helpers.escapehtml(channelsonline[channel].topic).italics() + " by " + srcname + "!</b></font>", channel);				
		}

		,

		topic: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].length > 200){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a topic with at most 200 characters.</i>", channel);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change the channeltopic because this channel is not registered.</i>", channel);
				return;
			}
			var topic = command[1].toLowerCase() == "default" ? "Welcome to " + channelname + "!" : command[1];
			channelsonline[channel].topic = topic
			if (channel == 0){
				channelsregistered["|main|"].topic = topic;
				sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
			}
			else {
				channelsregistered[channelname.toLowerCase()].topic = topic;
				sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));			
			}
			sys.sendHtmlAll("<timestamp/><font color='Indigo'><b> The Channel topic has been changed to " + helpers.escapehtml(channelsonline[channel].topic).italics() + " by " + srcname + "!</b></font>", channel);				
		}

		,

		combinechar: function (src, channel, command) {
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change the allowing of combining characters because this channel is not registered.</i>", channel);
				return;
			}     
			if (command[1] == "on"){
				if (channelsonline[channel].combinecharacters  == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn combining characters on because they are already turned on.</i>", channel);
					return;
				}
				if (channelsonline[channel].combinecharacters  == "off"){
					channelsonline[channel].combinecharacters  = "on";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].combinecharacters  = "on";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].combinecharacters  = "on";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='indigo'>Combining characters have been turned on by " + srcname + ".</font></b>", channel);
					return;
				}
			}
			if (command[1] == "off"){
				if (channelsonline[channel].combinecharacters == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn combining characters off because they are already turned off.</i>", channel);
					return;
				}
				if (channelsonline[channel].combinecharacters  == "on"){
					channelsonline[channel].combinecharacters  = "off";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].combinecharacters = "off";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].combinecharacters = "off";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='indigo'>Combining characters have been turned off by " + srcname + ".</font></b>", channel);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel); 
		}

		,

		reversechar: function (src, channel, command) {
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change the allowing of reversing characters because this channel is not registered.</i>", channel);
				return;
			}     
			if (command[1] == "on"){
				if (channelsonline[channel].reversecharacters == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn reversing characters on because they are already turned on.</i>", channel);
					return;
				}
				if (channelsonline[channel].reversecharacters == "off"){
					channelsonline[channel].reversecharacters = "on";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].reversecharacters = "on";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].reversecharacters = "on";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='indigo'>Reversing characters have been turned on by " + srcname + ".</font></b>", channel);
					return;
				}
			}
			if (command[1] == "off"){
				if (channelsonline[channel].reversecharacters == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn reversing characters off because they are already turned off.</i>", channel);
					return;
				}
				if (channelsonline[channel].reversecharacters == "on"){
					channelsonline[channel].reversecharacters = "off";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].reversecharacters = "off";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].reversecharacters = "off";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='indigo'>Reversing characters have been turned off by " + srcname + ".</font></b>", channel);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel); 
		}

		,

		clearcauths: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot clear the auth of this channel because it is not registered.</i>", channel);
				return;
			}
			channelsonline[channel].owners = new Array();
			channelsonline[channel].admins = new Array();
			channelsonline[channel].mods = new Array();
			if (channel == 0){
				channelsregistered["|main|"].owners = new Array();
				channelsregistered["|main|"].admins = new Array();
				channelsregistered["|main|"].mods = new Array();
				sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
			}
			else {
				channelsregistered[channelname.toLowerCase()].owners = new Array();
				channelsregistered[channelname.toLowerCase()].admins = new Array();
				channelsregistered[channelname.toLowerCase()].mods = new Array();
				sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));			
			}
			sys.sendHtmlAll("<timestamp/><font color='indigo'><b> All Channel Auth has been cleared by " + srcname + ".</b></font>", channel);	
		}

		,

		clearctourauths: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot clear the tournament auth of this channel because it is not registered.</i>", channel);
				return;
			}
			channelsonline[channel].touradmins = new Array();
			if (channel == 0){
				channelsregistered["|main|"].touradmins = new Array();
				sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
			}
			else {
				channelsregistered[channelname.toLowerCase()].touradmins = new Array();
				sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));			
			}
			sys.sendHtmlAll("<timestamp/><font color='indigo'><b> All Channel Tournament Auth has been cleared by " + srcname + ".</b></font>", channel);	
		}

		,

		registerthis: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (channel == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot register this channel because it is registered by default.</i>", channel);
				return;
			}
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (channelname.indexOf("/") != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot register this channel because <b>/</b> cannot be saved. </i>", channel);
				return;				
			}
			if (registeredchannels.length == registeredchannelslimit){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot register this channel because the maximum amount of channels have been registered. </i>", channel);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot register this channel because it is already registered.</i>", channel);
				return;
			}
			registeredchannels.push(channelname.toLowerCase());
			sys.saveVal("Channel_Options_RegisteredChannels", JSON.stringify(registeredchannels));
			var date = new Date(); date = String(date);
			channelsregistered[channelname.toLowerCase()] = new Object();
			channelsregistered[channelname.toLowerCase()].registereddate = date;
			channelsregistered[channelname.toLowerCase()].owners = new Array();
			channelsregistered[channelname.toLowerCase()].owners.push(srcname.toLowerCase());				
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
			sys.sendHtmlAll("<timestamp/><b><font color='indigo'> " + channelname + " has been registered by " + srcname + "!</b></font>", channel);
			sys.sendHtmlAll("<timestamp/><b>" + srcname + " has been made " + ChannelAuthLevel3Name + " of " + channelname + " by the server!</b>", channel);
		}

		,

		unregisterthis: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (channel == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot unregister this channel because it is registered by default.</i>", channel);
				return;
			}
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot unregister this channel because it is not registered.</i>", channel);
				return;
			}
			registeredchannels.splice(registeredchannels.indexOf(channelname.toLowerCase()), 1);
			sys.saveVal("Channel_Options_RegisteredChannels", JSON.stringify(registeredchannels));
			sys.removeVal("Registered_Channel_" + channelname.toLowerCase());
			delete channelsregistered[channelname.toLowerCase()];
			sys.sendHtmlAll("<timestamp/><b><font color='indigo'> " + channelname + " has been unregistered by " + srcname + "!</b></font>", channel);
		}

		,

		restartthis: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (channel == 0){
				helpers.channelsonlineload();
				helpers.channelsregisteredload();
			}
			else {
				script.afterChannelCreated(channel, channelname, src);				
			}
			sys.sendHtmlAll("<timestamp/><b><font color='indigo'> " + channelname + " has been restarted by " + srcname + "!</b></font>", channel);
		}

		,

		tempstay: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src);
			if (channel == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to use tempstay because this channel always stays.</i>", channel);
				return;
			}
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].toLowerCase() != "off" && command[1].toLowerCase() != "on"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify <b>off</b> or <b>on</b>.</i>", channel);
				return;
			}
			if (command[1].toLowerCase() == "on"){
				if (channelsonline[channel].stay == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change tempstay to on because it is already set to on.</i>", channel);
					return;
				}
				channelsonline[channel].stay = "on";
				sys.sendHtmlAll("<timestamp/><b><font color='indigo'> Temp stay of this channel has been set to on by " + srcname + "!</b></font>", channel);
			}
			if (command[1].toLowerCase() == "off"){
				if (channelsonline[channel].stay == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change tempstay to off because it is already set to off.</i>", channel);
					return;
				}
				channelsonline[channel].stay = "off";
				sys.sendHtmlAll("<timestamp/><b><font color='indigo'> Temp stay of this channel has been set to off by " + srcname + "!</b></font>", channel);
			}
		}
		
		,

		stay: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src), channelname = sys.channel(channel);
			if (channel == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to use stay because this channel always stays.</i>", channel);
				return;
			}
			if (srcauth < 3 && playersonline[src].channelauth[channel] != 3){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (command[1].toLowerCase() != "off" && command[1].toLowerCase() != "on"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify <b>off</b> or <b>on</b>.</i>", channel);
				return;
			}
			if (command[1].toLowerCase() == "on"){
				if (channelsonline[channel].stay == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change stay to on because it is already set to on.</i>", channel);
					return;
				}
				channelsonline[channel].stay = "on";
				channelsregistered[channelname.toLowerCase()].stay = "on";
				sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));	
				sys.sendHtmlAll("<timestamp/><b><font color='indigo'> Stay of this channel has been set to on by " + srcname + "!</b></font>", channel);
			}
			if (command[1].toLowerCase() == "off"){
				if (channelsonline[channel].stay == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change stay to off because it is already set to off.</i>", channel);
					return;
				}
				channelsonline[channel].stay = "off";
				channelsregistered[channelname.toLowerCase()].stay = "off";
				sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));	
				sys.sendHtmlAll("<timestamp/><b><font color='indigo'> Stay of this channel has been set to off by " + srcname + "!</b></font>", channel);
			}
		}
		
		,

		ckick: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src);
			if (srcauth < 1 && playersonline[src].channelauth[channel] < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var trgt = sys.id(command[1]);
			if (trgt === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not currently on the server.</i>", channel);
				return;
			}
			var cplayers = sys.playersOfChannel(channel);
			if (cplayers.indexOf(trgt) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is not currently on the channel.</i>", channel);
				return;
			}
			if (src == trgt){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to channel kick yourself.</i>", channel);
				return;
			}
			var trgtname = sys.name(trgt), trgtauth = sys.auth(trgt);
			srcauth = srcauth < playersonline[src].channelauth[channel] ? playersonline[src].channelauth[channel] : srcauth;
			trgtauth = trgtauth < playersonline[trgt].channelauth[channel] ? playersonline[trgt].channelauth[channel] : trgtauth;
			if (srcauth <= trgtauth){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to  channel kick " + trgtname + " because their auth level is not below yours.</i>", channel);
				return;
			}
			sys.sendHtmlAll("<timestamp/><font color='royalblue'><b>" + trgtname + " has been kicked from the channel by " + srcname + "!</b></font>", channel);
			if (sys.channelsOfPlayer(trgt).length > 1){
   			sys.callQuickly("sys.kick(" + trgt + "," + channel + ");", 200);
				return;
			}
			sys.callQuickly("sys.kick(" + trgt + ");", 200);			
		}

		,

		html: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src);
			if (srcauth < 1 && playersonline[src].channelauth[channel] < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (srcauth < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}
			command.splice(0,1);
			command = command.join("*");
			var color = helpers.namecolor(src);
			var htmlmessage =  srcauth > 0 ? "<font color=" + color + "><timestamp />+<b><i>" + srcname + ":</i></b></font> " + command : "<font color=" + color + "><timestamp /><b>" + srcname + ":</b></font> " + command;
			sys.sendHtmlAll(htmlmessage, channel);
		}

		,

		cwall: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src);
			if (srcauth < 1 && playersonline[src].channelauth[channel] < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (srcauth < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}
			command.splice(0,1);
			command = command.join("*");
			var bordermessage1 = border2 + "<br/>", bordermessage2 = "<br/>" + border2, cwallmessage = srcname + ": " + command;
			sys.sendHtmlAll(bordermessage1, channel);
   		sys.sendAll(cwallmessage, channel);
  			sys.sendHtmlAll(bordermessage2, channel);
		}

		,

		chtmlwall: function(src, channel, command){
			var srcname = sys.name(src), srcauth = sys.auth(src);
			if (srcauth < 1 && playersonline[src].channelauth[channel] < 1){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (srcauth < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}	
			var color = helpers.namecolor(src);
			command.splice(0,1);
			command = command.join("*");
			var htmlmessage = srcauth > 0 ? "<font color=" + color + "><timestamp />+<b><i>" + srcname + ":</i></b></font> " + command : "<font color=" + color + "><timestamp /><b>" + srcname + ":</b></font> " + command;
			var chtmlwallmessage = border2 + "<br/>"
   		+ "<br/>"
   		+ htmlmessage + "<br/>"
   		+ "<br/>"
   		+ border2;
   		sys.sendHtmlAll(chtmlwallmessage, channel);
		}

		,



		me: function(src, channel, command){
			if (sys.auth(src) < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}	
			var color = helpers.namecolor(src);
			command.splice(0,1);
			command = command.join("*");
			sys.sendHtmlAll("<font color =" + color + "><timestamp /><b><i>*** " + srcname + "</i></b></font> " + helpers.escapehtml(command).fontcolor(color).italics(), channel);
		}
		
		,

		imp: function(src, channel, command){
			if (sys.auth(src) < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}	
			if (command[1].length > 20){
				sys.sendHtmlMessage(src, "<i>Sorry, you must specify a name with at most 20 characters.</i>", channel);
				return;
			}
			var name = command[1], color = helpers.namecolor(src);
			command.splice(0,2);
			command = command.join("*");
			sys.sendHtmlAll("<font color =" + color + "><timestamp /><b>" + helpers.escapehtml(name) + ": </b></font> " + helpers.escapehtml(command) + " <b><i><small> Impersonation by " + srcname + "</small></i></b>" , channel);
		}

		,

		reverse: function(src, channel, command){
			if (sys.auth(src) < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			var srcname = sys.name(src);
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}
			command.splice(0,1);
			command = command.join("*");
			command = command.split("");
			command = command.reverse();
			command = command.join("");
			sys.sendAll(srcname + ": " + command, channel);
		}

		,

		future: function(src, channel, command){
			if (sys.auth(src) < silence){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
				return;
			}
			var srcname = sys.name(src), srcip = sys.ip(src);
			if (helpers.mutecheck(srcname) == true){
				helpers.mutemessage(src, channel);
				return;
			}				
			var color = helpers.namecolor(src), futuretime = parseInt(command[1]), futureunit = command[2];
			if (helpers.nottimeunit(futureunit)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to use future because you have not specified a valid unit of time.</i>", channel);
				return;
			}	
			if (isNaN(futuretime)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a value for the amount of " + futureunit + " you want the message to be sent in.</i>", channel);
				return;
			}
			if (futuretime < 1){
				sys.sendAll(srcname + ": " + command[3], channel);
				return;
			}
			if (future[srcip] === undefined){
				future[srcip] = 0;
			}
			if (future[srcip] >= futurelimit){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you have reached the future limit. Please wait until your number of pending futures is decreased.</i>", channel);
				return;
			}
			future[srcip]++;
			var futureseconds = helpers.converttoseconds(futureunit, futuretime);
			futureunit = helpers.timeplurality(futuretime, futureunit);
			command.splice(0,3);
			command = command.join("*");
			var futuremessage = sys.dbAuth(srcname) > 0 ? "<font color=" + color + "><timestamp />+<b><i>" + srcname + ":</i></b></font> " + helpers.escapehtml(command) + "<b><i><small> (sent " + futuretime + " " + futureunit + " ago) </small></i></b>" : "<font color=" + color + "><timestamp /><b>" + srcname + ":</b></font> " + helpers.escapehtml(command) + "<b><i><small> (sent " + futuretime + " " + futureunit + " ago) </small></i></b>";
			var futurefunction = function(){
				if (sys.channel(channel) != undefined){
					sys.sendHtmlAll(futuremessage, channel);
				}
				future[srcip]--;
				if (future[srcip] === 0){
					delete future[srcip];
				}
			}
			var futuresentmessage = border + "<br/>"
			+ "<timestamp/> Your message has been sent " + futuretime + " " + futureunit + " into the future!<br/>"
			+ border;
			sys.sendHtmlMessage(src, futuresentmessage, channel);
			sys.delayedCall(futurefunction, futureseconds); 
		}

		,

		joinchannel: function(src, channel, command){
			if (command[1].length > 20){
				sys.sendHtmlMessage(src, "<i>Sorry, you must specify a name with at most 20 characters.</i>" , channel);
				return;
			}
			if (sys.existChannel(command[1]) == true){
				var channeltojoin = sys.channelId(command[1]);
				if (sys.isInChannel(src, channeltojoin) == true){
					sys.sendHtmlMessage(src, "<i>Sorry, you are already in the " + command[1].bold() + " channel.</i>" , channel);
					return;
				}
				sys.putInChannel(src, channeltojoin);
				return;
			}
			sys.createChannel(command[1]);
			var newchannel = sys.channelId(command[1]);
			script.afterChannelCreated(newchannel, command[1], src);
			sys.putInChannel(src, newchannel);
		}

		,

		leavechannel: function(src, channel, command){
			if (sys.channelsOfPlayer(src).length == 1){
				sys.sendHtmlMessage(src, "<i>Sorry, you must have one channel open at all times.</i>" , channel);				
				return;
			}
			sys.kick(src, channel);
		}

		,

		cplayersonline: function(src, channel, command){
			var cplayersonline = sys.playersOfChannel(channel), cplayersonlineindex, channelname = sys.channel(channel);
			var cplayersmessage = border
			+ "<h2> Players Online in " + channelname + " </h2>"
			for (cplayersonlineindex in cplayersonline){
				var playername = members[sys.name(cplayersonline[cplayersonlineindex]).toLowerCase()];
				cplayersmessage += helpers.connectstatus(playername);
			}
			cplayersmessage += "<br/>"
			+ "<br/>"
			+ "<b>Total Players Online in " + channelname + ": </b>" + cplayersonline.length + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cplayersmessage, channel);
		}
		
		,

		cauths: function (src, channel, command){
			var sauths = sys.dbAuths(), cauthmembers = channelsonline[channel].owners.length + channelsonline[channel].admins.length + channelsonline[channel].mods.length + sauths.length;
			if (cauthmembers == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, there is currently no channel auth.</i>", channel);
				return;
			}
			helpers.setautharray("mods", 1);
			helpers.setautharray("admins", 2);
			helpers.setautharray("owners", 3);
			var cauthsmessage = border
			+ "<h2>Channel Auth List</h2>";
			if (channelsonline[channel].owners.length > 0){
				cauthsmessage += "<br/>"
				+ "<font size='4' color='indigo'>" + ChannelAuthLevel3Name + "s</font>";
				for (var ownersindex in channelsonline[channel].owners){
					if(members[channelsonline[channel].owners[ownersindex]] !== undefined){
						cauthsmessage += helpers.connectstatus(members[channelsonline[channel].owners[ownersindex]]);
					}
					else {
						cauthsmessage += helpers.connectstatus(channelsonline[channel].owners[ownersindex]);
					}
				}
				if (owners.length === 0){
					cauthsmessage += "<br/>";
				}
			}
			cauthsmessage += helpers.authlistdisplay("owners", 3, "blueviolet");
			if (channelsonline[channel].admins.length > 0){
				cauthsmessage+= "<br/>"
				+ "<font size='4' color='coral'>" + ChannelAuthLevel2Name + "s</font>";
				for (var adminsindex in channelsonline[channel].admins){
					if(members[channelsonline[channel].admins[adminsindex]] !== undefined){
						cauthsmessage += helpers.connectstatus(members[channelsonline[channel].admins[adminsindex]]);
					}
					else {
						cauthsmessage += helpers.connectstatus(channelsonline[channel].admins[adminsindex]);
					}
				}
				if (admins.length === 0){
					cauthsmessage += "<br/>";
				}
			}
			cauthsmessage += helpers.authlistdisplay("admins", 2, "#FF6900");
			if (channelsonline[channel].mods.length > 0){
				cauthsmessage += "<br/>" 
				+ "<font size='4' color='royalblue'>" + ChannelAuthLevel1Name + "s</font>";
				for (var modsindex in channelsonline[channel].mods){
					if(members[channelsonline[channel].mods[modsindex]] !== undefined){
						cauthsmessage += helpers.connectstatus(members[channelsonline[channel].mods[modsindex]]);
					}
					else {
						cauthsmessage += helpers.connectstatus(channelsonline[channel].mods[modsindex]);
					}
				}
				if (mods.length === 0){
					cauthsmessage += "<br/>";
				}
			}
			cauthsmessage += helpers.authlistdisplay("mods", 1, "blue")
			+ "<br/>"
			+ "<b>Total Auth Members: </b>" + cauthmembers + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, cauthsmessage, channel);
		}

		,


		channelinfo: function(src, channel, command){
			var channelname = sys.channel(channel), regstatus = "<font color='red'>Unregistered</font>", staystatus = "Off", runtime = "Unknown", begintime = "Unknown", channelregdate = "N/A";
			if (registeredchannels.indexOf(channelname.toLowerCase()) != -1 || channel == 0){
				regstatus = "<font color='green'>Registered</font>";
			}
			if (channelsonline[channel].stay == "on" || channel == 0){
				staystatus = "On";
			}
			if (channelsonline[channel].starttime != undefined){
				runtime = new Date() - channelsonline[channel].starttime;
				runtime = helpers.converttime(runtime);
				begintime = channelsonline[channel].starttime;
			}
			if (channel == 0){
				runtime = new Date() - starttime;
				runtime = helpers.converttime(runtime);
				begintime = starttime;
			}
			if (channelsregistered[channelname.toLowerCase()] != undefined){
				channelregdate = channelsregistered[channelname.toLowerCase()].registereddate;
			}
			var channelinfo = border
			+ "<h2>Channel Info</h2>"
			+ "<h3><u>General</u></h3>"
			+ "<b>Channel Name: </b>" + channelname + "<br/>"
			+ "<b>Channel Number: </b>" + channel + "<br/>"
			+ "<b>Registered Status: </b>" + regstatus + "<br/>"
			+ "<b>Stay Status: </b>" + staystatus
			+ "<h3><font color='blueviolet'><u>Time</u></font></h3>"
			+ "<b><font color='blueviolet'>Channel Start Time: </font></b>" + begintime + "<br/>"
			+ "<b><font color='blueviolet'>Channel Run Time: </font></b>" + runtime + "<br/>"
			+ "<b><font color='blueviolet'>Channel Registration Date: </font></b>" + channelregdate + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, channelinfo, channel);			
		}

		,

		tour: function(src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode != 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to start a tournament because one is still currently running.</i>", channel); 
				return;
			} 
			var tiers = sys.getTierList();
			for (var tiersindex in tiers){
				if (command[1].toLowerCase() == tiers[tiersindex].toLowerCase()){
					var temptourtier = tiers[tiersindex];  
				}
			}
			tour[channel].tourtier = temptourtier
			if (tour[channel].tourtier === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, the server does not recognise the " + command[1] + " tier.</i>", channel);     
				return;          
			}   
			tour[channel].tournumber = parseInt(command[2]);
			if (isNaN(tour[channel].tournumber) || tour[channel].tournumber <= 2){                        
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a tournament size of 3 or more.</i>", channel);
				return;
			}
			tour[channel].tourmode = 1;
			tour[channel].tourcurrentnumber = tour[channel].tournumber;
			tour[channel].tourmembers = new Array();
			tour[channel].tourbattlers = new Array();
			tour[channel].tourwinners = new Array();
			tour[channel].tourlosers = new Array();
			tour[channel].tourstarter = sys.name(src);
			tour[channel].tourstarttime = new Date();
			tour[channel].tourclauses = sys.getClauses(tour[channel].tourtier);
			helpers.tourdisplay(0, channel);
		}

		,

		toursize: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change the tournament size because a tournament is not currently running.</i>", channel);
				return;
			}
			if (tour[channel].tourmode == 2){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change the tournament size because the tournament has passed the sign-up phase.</i>", channel);
				return;
			}
			var temptournumber = parseInt(command[1]);
			if (isNaN(temptournumber) || temptournumber <= 2){                        
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you must specify a tournament size of 3 or more.</i>", channel);
				return;
			}
			if (temptournumber == tour[channel].tournumber){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to change the tournament size because it's already " + temptournumber + ".</i>", channel);
				return;
			}
			var temptourcount = temptournumber - tour[channel].tourmembers.length;
			if (temptourcount < 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to lower the tournament size to " + command[1] + " because " + tour[channel].tourmembers.length + " players have already registered.</i>", channel);
				return;
			}
			tour[channel].tournumber = temptournumber;
			tour[channel].tourcurrentnumber = temptournumber;
			var plurality = helpers.tourcount(channel) == 1 ? " spot is left!" : " spots are left!";
			var toursizemessage = border2 + "<br/>"
			+ "<font color='mediumseagreen'><b>The tournament size was changed to " + temptournumber + " by " + sys.name(src) + "!</b></font><br/>"
			+ "<timestamp/><b>" + helpers.tourcount(channel) + plurality + "</b><br/>"
			+ border2;
			sys.sendHtmlAll(toursizemessage, channel);
			if (helpers.tourcount(channel) == 0){
				helpers.tourstart(channel);
			}
		}

		,

		endtour: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to end a tournament because one is not currently running.</i>", channel);
				return;
			}
			tour[channel].tourmode = 0;                               
			sys.sendHtmlAll(border2 + "<br/><timestamp/><font color='mediumseagreen'><b>The " + tour[channel].tourtier + " tournament has been cancelled by " + sys.name(src) + ".</b></font><br/>" + border2, channel);
		}

		,

		nontourmatch: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare a tournament match unofficial because a tournament is not currently running.</i>", channel); 
				return;
			}
			if (tour[channel].tourmode == 1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare a tournament match unofficial because the tournament is still in the sign-up phase.</i>", channel); 
				return;
			}
			var srcname = sys.name(src);
			if (command[1][0] == "|" && command[1][command[1].length-1] == "|" && !isNaN(parseInt(command[1].substring(1, command[1].length-1)))){
				var matchnumber = parseInt(command[1].substring(1, command[1].length-1));
				if (matchnumber > Math.floor(tour[channel].tourcurrentnumber/2) || matchnumber < 1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare a tournament match unofficial because that match number does not exist for this round.</i>", channel); 
					return;
				}
				var tourbattler = tour[channel].tourmembers[matchnumber*2 - 2], tourbattler2 = tour[channel].tourmembers[matchnumber*2 - 1];
				if (tour[channel].tourbattlers.indexOf(tourbattler) == -1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare match " + matchnumber + " unofficial because it is not an ongoing match.</i>", channel)
					return;
				}
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(tourbattler), 1);
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(tourbattler2), 1);
				sys.sendHtmlAll(border2 + "<br/><timestamp/><b><font color='mediumseagreen'>Match " + matchnumber + " has been declared unofficial by " + srcname + "!<br/></font></b>" + border2, channel);
				return;
			}
			var tourbattler = command[1].toLowerCase();
			if (tour[channel].tourmembers.indexOf(tourbattler) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare " + command[1] + "'s match unofficial because they are not a player in the tournament.</i>", channel);
				return;
			}
			if (tour[channel].tourbattlers.indexOf(tourbattler) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare " + command[1] + "'s match unofficial because they are not in a tournament match.</i>", channel);
				return;				
			}
			var tourbattler2 = helpers.opponentof(tourbattler, channel);
			tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(tourbattler), 1);
			tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(tourbattler2), 1);
			sys.sendHtmlAll(border2 + "<br/><timestamp/><b><font color='mediumseagreen'>" + members[tourbattler] + "'s match has been declared unofficial by " + srcname + "!</font></b><br/>" + border2, channel);	
		}

		,

		tourmatch: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare a match official because a tournament is not currently running.</i>", channel); 
				return;
			}
			if (tour[channel].tourmode == 1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare a match official because the tournament is still in the sign-up phase.</i>", channel); 
				return;
			}
			var srcname = sys.name(src);
			if (command[1][0] == "|" && command[1][command[1].length-1] == "|" && !isNaN(parseInt(command[1].substring(1, command[1].length-1)))){
				var matchnumber = parseInt(command[1].substring(1, command[1].length-1));
				if (matchnumber > Math.floor(tour[channel].tourcurrentnumber/2) || matchnumber < 1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare a match official because that match number does not exist for this round.</i>", channel); 
					return;
				}
				var tourbattler = tour[channel].tourmembers[matchnumber*2 - 2], tourbattler2 = tour[channel].tourmembers[matchnumber*2 - 1], battlersindex = battlers.indexOf(sys.id(tourbattler)), battlersindex2 = battlers.indexOf(sys.id(tourbattler2));
				if (helpers.nopair(battlersindex, battlersindex2)|| (battlersindex == -1) || (battlersindex2 == -1)){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare match " + matchnumber + " official because the paired players aren't battling each other.", channel)
					return;		
				}
				if (tour[channel].tourbattlers.indexOf(tourbattler) != -1 && tour[channel].tourbattlers.indexOf(tourbattler2) != -1	){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare match " + matchnumber + " official because it already is official.", channel)
					return;		
				}
				tour[channel].tourbattlers.push(tourbattler);
				tour[channel].tourbattlers.push(tourbattler2);
				sys.sendHtmlAll(border2 + "<br/><timestamp/><b><font color='mediumseagreen'>Match " + matchnumber + " has been declared official by " + srcname + "!</font></b><br/>" + border2, channel);
				return;
			}
			var tourbattler = command[1].toLowerCase();
			if (tour[channel].tourmembers.indexOf(tourbattler) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare " + command[1] + "'s match official because they are not a player in the tournament.</i>", channel);
				return;
			}
			var battlersindex = battlers.indexOf(sys.id(tourbattler));
			if (battlersindex == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare " + command[1] + "'s match official because they are not battling.</i>", channel);
				return;				
			}
			var tourbattler2 = helpers.opponentof(tourbattler, channel), battlersindex2 = battlers.indexOf(sys.id(tourbattler2));
			if (helpers.nopair(battlersindex, battlersindex2)||(battlersindex2 == -1)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare " + command[1] + "'s match official because they are not battling with the opponent.</i>", channel)
				return;		
			}
			if (tour[channel].tourbattlers.indexOf(tourbattler) != -1 && tour[channel].tourbattlers.indexOf(tourbattler2) != -1	){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to declare " + command[1] + "'s match official because it already is official.</i>", channel)
				return;		
			}
			tour[channel].tourbattlers.push(tourbattler);
			tour[channel].tourbattlers.push(tourbattler2);
			sys.sendHtmlAll(border2 + "<br/><timestamp/><b><font color='mediumseagreen'>" + members[tourbattler] + "'s match has been declared official by " + srcname + "!</font></b><br/>" + border2, channel);		
		}

		,

		resetmatch: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to reset a match because a tournament is not currently running.</i>"); 
				return;
			}
			if (tour[channel].tourmode == 1){
				sys.sendHtmlMessage(src, "<timestamp/>Sorry, you are unable to reset a match because the tournament is still in the sign-up phase.</i>"); 
				return;
			}
			var srcname = sys.name(src);
			if (command[1][0] == "|" && command[1][command[1].length-1] == "|" && !isNaN(parseInt(command[1].substring(1, command[1].length-1)))){
				var matchnumber = parseInt(command[1].substring(1, command[1].length-1));
				if (matchnumber > Math.floor(tour[channel].tourcurrentnumber/2) || matchnumber < 1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to reset a match because that match number does not exist for this round.</i>", channel); 
					return;
				}
				var tourbattler = tour[channel].tourmembers[matchnumber*2 - 2], tourbattler2 = tour[channel].tourmembers[matchnumber*2 - 1];
				if (tour[channel].tourwinners.indexOf(tourbattler) == -1 && tour[channel].tourlosers.indexOf(tourbattler) == - 1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to reset match " + matchnumber + " because it is not a completed match.</i>", channel)
					return;
				}
				if (tour[channel].tourwinners.indexOf(tourbattler) != -1 && tour[channel].tourlosers.indexOf(tourbattler2) != - 1){
					tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(tourbattler), 1);
					tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(tourbattler2), 1);
				}
				if (tour[channel].tourlosers.indexOf(tourbattler) != -1 && tour[channel].tourwinners.indexOf(tourbattler2) != - 1){
					tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(tourbattler2), 1);
					tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(tourbattler), 1);
				}
				sys.sendHtmlAll(border2 + "<br/><timestamp/><b><font color='mediumseagreen'>Match " + matchnumber + " has been reset by " + srcname + "!</font></b><br/>" + border2, channel);
				return;
			}
			var tourbattler = command[1].toLowerCase();
			if (tour[channel].tourmembers.indexOf(tourbattler) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to reset " + command[1] + "'s match because they are not a player in the tournament.</i>", channel);
				return;
			}
			if (tour[channel].tourlosers.indexOf(tourbattler) == -1 && tour[channel].tourwinners.indexOf(tourbattler) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to reset " + command[1] + "'s match because it hasn't been completed.</i>", channel);
				return;				
			}
			var tourbattler2 = helpers.opponentof(tourbattler, channel);
			if (tour[channel].tourwinners.indexOf(tourbattler) != -1 && tour[channel].tourlosers.indexOf(tourbattler2) != - 1){
				tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(tourbattler), 1);
				tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(tourbattler2), 1);
			}
			if (tour[channel].tourlosers.indexOf(tourbattler) != -1 && tour[channel].tourwinners.indexOf(tourbattler2) != - 1){
				tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(tourbattler2), 1);
				tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(tourbattler), 1);
			}
			sys.sendHtmlAll(border2 + "<br/><timestamp/><b><font color='mediumseagreen'>" + members[tourbattler] + "'s match has been reset by " + srcname + "!</font></b><br/>" + border2, channel);
		}

		,

		q: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			} 
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to qualify players because a tournament is not currently running in this channel.</i>", channel);
				return;
			}
			if (!helpers.memberscheck(command[1])){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to qualify players that are not in the member database.</i>", channel);
				return;
			}
			var trgtname = command[1].toLowerCase(), srcname = sys.name(src);
			if (tour[channel].tourmode == 1){
				if (tour[channel].tourmembers.indexOf(trgtname) != -1){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to add players who are already registered for this channel's tournament.</i>", channel);
					return;
				}                       
				if (helpers.tourcount(channel) > 0){
					tour[channel].tourmembers.push(trgtname);
					var plurality = helpers.tourcount(channel) == 1 ? "spot" : "spots";
					var addstring = "<timestamp/><font color='mediumseagreen'><b>" + members[trgtname] + " has been added to the tournament by " + srcname + "! " + helpers.tourcount(channel) + " more " + plurality + " left!</b></font>";
					sys.sendHtmlAll(addstring, channel);
					if (helpers.tourcount(channel) == 0){
						helpers.tourstart(channel);
					}
					return;
				}
			}
			if (tour[channel].tourlosers.indexOf(trgtname) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to qualify " + trgtname + " because they are out of the tournament in this channel.</i>", channel);
				return;
			}
			if (tour[channel].tourwinners.indexOf(trgtname) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to qualify " + trgtname + " because they have already qualified for the next round.</i>", channel);
				return;
			}
			var opponent = helpers.opponentof(trgtname, channel);
			var qmessage = border2 + "<br/>"
			+ "<timestamp/><font color='mediumseagreen'><b>" + members[trgtname] + " has been qualified to the next round by " + srcname + "!<b></font>"
			sys.sendHtmlAll(qmessage, channel);
			helpers.roundincrease(trgtname,opponent, channel);	                                                                                         
		}

		,

		dq: function (src, channel, command) {
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to disqualify players because a tournament is not currently running in this channel.</i>", channel);
				return;
			}
			var dqbattler = command[1].toLowerCase(), srcname = sys.name(src);
			if (!helpers.memberscheck(dqbattler)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to disqualify " + command[1] + " because they are not in the member database.</i>", channel);
				return;
			}
			if (tour[channel].tourmembers.indexOf(dqbattler) == - 1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to disqualify " + members[dqbattler] + " because they are not in the tournament in this channel.</i>", channel);
				return;
			}
			if (tour[channel].tourmode == 1){
				tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf(dqbattler),1);
				var removemessage = "<timestamp/><font color='mediumseagreen'><b>" + members[dqbattler] + " was removed from the tournament by " + srcname + "! " + helpers.tourcount(channel) + " more spots left!</b></font>"
				sys.sendHtmlAll(removemessage, channel);
				return;
			}
			if (tour[channel].tourlosers.indexOf(dqbattler) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to disqualify " + members[dqbattler] + " because they are already out of the tournament in this channel.</i>", channel);
				return;
			}
			var undqbattler = helpers.opponentof(dqbattler, channel);
			var disqualifymessage = border2 + "<br/>"
			+ "<timestamp/><font color='mediumseagreen'><b>" + members[dqbattler] + " has been disqualified by " + srcname + "!</b></font>";
			sys.sendHtmlAll(disqualifymessage, channel);
			helpers.roundincrease(undqbattler,dqbattler, channel);
		}

		,

		readyfortour: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src), channelname = sys.channel(channel);
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
    			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change readyfortour because this channel is not registered.</i>", channel);
    			return;
   		}					
			if (command[1] == "on"){
				if (channelsonline[channel].ReadyForTour == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn Ready for tournament battles on because it is already turned on.</i>", channel);
					return;
				}
				if (channelsonline[channel].ReadyForTour == "off"){
					channelsonline[channel].ReadyForTour = "on";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].ReadyForTour = "on";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].ReadyForTour = "on";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Ready for tournament battles has been turned on by " + srcname + ".</font></b>", channel);
					return;
				}
			}
			if (command[1] == "off"){
				if (channelsonline[channel].ReadyForTour == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn Ready for tournament battles off because it is already turned off.</i>", channel);
					return;
				}
				if (channelsonline[channel].ReadyForTour == "on"){
					channelsonline[channel].ReadyForTour = "off";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].ReadyForTour = "off";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].ReadyForTour  = "off";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Ready for tournament battles has been turned off by " + srcname + ".</font></b>", channel);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel);               
		}

		,

		forcetourbattles: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src), channelname = sys.channel(channel);
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
    			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change forcetourbattles because this channel is not registered.</i>", channel);
    			return;
   		}					
			if (command[1] == "on"){
				if (channelsonline[channel].ForceTourBattles == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn Forcing tournament battles on because it is already turned on.</i>", channel);
					return;
				}
				if (channelsonline[channel].ForceTourBattles == "off"){
					channelsonline[channel].ForceTourBattles = "on";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].ForceTourBattles = "on";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].ForceTourBattles  = "on";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Forcing tournament battles has been turned on by " + srcname + ".</font></b>", channel);
					return;
				}
			}
			if (command[1] == "off"){
				if (channelsonline[channel].ForceTourBattles == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn Forcing tournament battles off because it is already turned off.</i>", channel);
					return;
				}
				if (channelsonline[channel].ForceTourBattles == "on"){
					channelsonline[channel].ForceTourBattles = "off";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].ForceTourBattles = "off";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].ForceTourBattles  = "off";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Forcing tournament battles has been turned off by " + srcname + ".</font></b>", channel);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel);               
		}

		,

		autostartbattles: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src), channelname = sys.channel(channel);
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
    			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change autostartbattles because this channel is not registered.</i>", channel);
    			return;
   		}			
			if (command[1] == "on"){
				if (channelsonline[channel].AutoStartBattles == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn Auto-starting battles  on because it is already turned on.</i>", channel);
					return;
				}
				if (channelsonline[channel].AutoStartBattles  == "off"){
					channelsonline[channel].AutoStartBattles  = "on";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].AutoStartBattles = "on";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].AutoStartBattles  = "on";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Auto-starting battles  has been turned on by " + srcname + ".</font></b>", channel);
					return;
				}
			}
			if (command[1] == "off"){
				if (channelsonline[channel].AutoStartBattles  == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn Auto-starting battles  off because it is already turned off.</i>", channel);
					return;
				}
				if (channelsonline[channel].AutoStartBattles  == "on"){
					channelsonline[channel].AutoStartBattles  = "off";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].AutoStartBattles = "off";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].AutoStartBattles  = "off";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Auto-starting battles has been turned off by " + srcname + ".</font></b>", channel);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel);               
		}

		,

		enforcetourclauses: function (src, channel, command){
			if (!helpers.tourpermission(src, channel)){
				helpers.failpermissionmessage(src, channel, command[0]);
				return;
			}
			var srcname = sys.name(src), channelname = sys.channel(channel);
			if (registeredchannels.indexOf(channelname.toLowerCase()) == -1 && channel != 0){
    			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you cannot change enforcetourclauses because this channel is not registered.</i>", channel);
    			return;
   		}			
			if (command[1] == "on"){
				if (channelsonline[channel].EnforceTourClauses == "on"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn enforcing tournament clauses on because it is already turned on.</i>", channel);
					return;
				}
				if (channelsonline[channel].EnforceTourClauses  == "off"){
					channelsonline[channel].EnforceTourClauses  = "on";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].EnforceTourClauses = "on";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].EnforceTourClauses = "on";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Enforcing tournament clauses  has been turned on by " + srcname + ".</font></b>", channel);
					return;
				}
			}
			if (command[1] == "off"){
				if (channelsonline[channel].EnforceTourClauses  == "off"){
					sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to turn enforcing tournament clauses  off because it is already turned off.</i>", channel);
					return;
				}
				if (channelsonline[channel].EnforceTourClauses  == "on"){
					channelsonline[channel].EnforceTourClauses  = "off";
					if (channel != 0){
						channelsregistered[channelname.toLowerCase()].EnforceTourClauses = "off";
						sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
					}
					else {
						channelsregistered["|main|"].EnforceTourClauses  = "off";
						sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
					}
					sys.sendHtmlAll("<timestamp/><b><font color='mediumseagreen'>Enforcing tournament clauses has been turned off by " + srcname + ".</font></b>", channel);
					return;
				} 
			}
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, <b>on</b> or <b>off</b> are the only valid arguments for the " + command[0] + " command.</i>", channel);               
		}

		,

		ctourauths: function (src, channel, command){
			var tourauthlength = tourauth.length + channelsonline[channel].touradmins.length;
			if (tourauthlength == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, there is currently no channel tournament auth.</i>", channel);
				return;
			}
			var tourauthindex, tourauthlist = "";
			for (tourauthindex in tourauth){
				if (members[tourauth[tourauthindex]] !== undefined){
					tourauthlist += helpers.connectstatus(members[tourauth[tourauthindex]]);
				}
				else {
					tourauthlist += helpers.connectstatus(tourauth[tourauthindex]);
				}
			}
			var ctourauthindex, ctourauthlist = "", ctourauth = channelsonline[channel].touradmins;
			for (ctourauthindex in ctourauth){
				if (members[ctourauth[ctourauthindex]] !== undefined){
					ctourauthlist += helpers.connectstatus(members[ctourauth[ctourauthindex]]);
				}
				else {
					ctourauthlist += helpers.connectstatus(ctourauth[ctourauthindex]);
				}
			}
			var tourauthsmessage = border 
			+ "<h2>Channel Tournament Auth List</h2>";
			if (ctourauthlist !== ""){
				tourauthsmessage += "<font color='mediumseagreen' size=4>" + ChannelTourAuthLevel1Name + "s:</font>"
				+ ctourauthlist + "<br/>"
				+ "<br/>";
			}
			if (tourauthlist !== ""){
				tourauthsmessage += "<font color='green' size=4>" + TourAuthLevel1Name + "s:</font>"
				+ tourauthlist + "<br/>"
				+ "<br/>";
			}
			tourauthsmessage += "<b>Total Auth Members: </b>" + String(tourauthlength) + "<br/>"
			+ "<br/>"
			+ "<timestamp/><br/>"
			+ border;
			sys.sendHtmlMessage(src, tourauthsmessage, channel);
		}

		,


		join: function (src, channel, command){
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to join because a tournament is not currently running in this channel.</i>", channel);
				return;
			}
			if (tour[channel].tourmode == 2){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to join because the tournament has passed the sign-up phase in this channel.</i>", channel);
				return;
			}
			if (channelsonline[channel].ReadyForTour == "on" && battlers.indexOf(src) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to join because you are currently battling.</i>", channel);
				return;				
			}
			var srcname = sys.name(src);				
			if (helpers.tourmembersnumber(srcname.toLowerCase(), channel) !== undefined ){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are already in the tournament in this channel. You are not able to enter more than once.</i>", channel);
				return;
			}              
			var srctier = sys.tier(src);
			if (tour[channel].tourtier != srctier){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are currently not battling in the " + tour[channel].tourtier + " tier. Change your tier to " + tour[channel].tourtier + " to be able to join.</i>", channel);
				return;
			}
			if (helpers.tourcount(channel) > 0){
				tour[channel].tourmembers.push(srcname.toLowerCase());
				var plurality = helpers.tourcount(channel) == 1 ? "spot" : "spots";
				var joinstring = "<timestamp/><font color='brown'><b>" + srcname + " joined the tournament! " + helpers.tourcount(channel) + " more " + plurality + " left!</b></font>";
				sys.sendHtmlAll(joinstring, channel);
				if (helpers.tourcount(channel) == 0){
					helpers.tourstart(channel);
				} 
			}  
		}

		,

		leave: function (src, channel, command){
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to leave a tournament because one is not currently running in this channel.</i>", channel);
				return;
			}
			var leavebattler = sys.name(src).toLowerCase();
			if (tour[channel].tourmembers.indexOf(leavebattler) == -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to leave because you are not in the tournament in this channel.</i>", channel);
				return;
			}
			if (tour[channel].tourmode == 1){
				tour[channel].tourmembers.splice(tour[channel].tourmembers.indexOf(leavebattler),1);
				var leftmessage = "<timestamp/><font color='brown'><b>" + members[leavebattler] + " has left the tournament. " + helpers.tourcount(channel) + " more spots left!</b></font>";
				sys.sendHtmlAll(leftmessage, channel);
				return;
			}
			if (tour[channel].tourlosers.indexOf(leavebattler) != -1){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to leave because you are already out of the tournament in this channel.</i>", channel);
				return;
			}
			var unleavebattler = helpers.opponentof(leavebattler, channel);
			var leavemessage = border2 + "<br/>"
			+ "<timestamp/><font color='brown'><b>" + members[leavebattler] + " has left the tournament!<b></font>"
			sys.sendHtmlAll(leavemessage, channel);
			helpers.roundincrease(unleavebattler,leavebattler, channel);	
		}

		,

		viewtour: function (src, channel, command){
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to view the tournament information because a tournament is not currently running.</i>", channel);
				return;
			}
			if (tour[channel].tourmode == 1){
				receiver = src;
				helpers.tourdisplay(1, channel);
				return;
			}
			receiver = src;
			helpers.tourdisplay(2, channel);
		}

		,

		viewround: function (src, channel, command){
			if (tour[channel].tourmode == 0){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to view the round because a tournament is not currently running.</i>", channel);
				return;
			}
			if (tour[channel].tourmode == 1){
				var tourplayerlist = "", tourmembersindex;
				for (tourmembersindex = 0; tourmembersindex < tour[channel].tourmembers.length; tourmembersindex++){
					tourplayerlist += "<b>" + (tourmembersindex+1) + ". " + members[tour[channel].tourmembers[tourmembersindex]] + "</b><br/>";
				}
				var viewroundmessage = border
				+ "<h3> Players in the " + tour[channel].tourtier + " Tournament: </h3>"
				+ tourplayerlist
				+ "<br/>"
				+ "<timestamp/><br/>"
				+ border;
				sys.sendHtmlMessage(src, viewroundmessage, channel);		
				return;
			}
			receiver = src;
			helpers.rounddisplay(0, channel);
		}
	}
	commands[helpers.removespaces(AuthLevel3Name).toLowerCase() + "commands"] = function (src, channel, command){
		var ownercommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(AuthLevel3Name) + " Commands</h2>"
		+ "<br/>" 
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/arboptions</b></font>: displays the Arbitration Options.<br/>"
		+ "<b>\u2022  <font color='green'>/authoptions</b></font>: displays the Authority Options.<br/>"
		+ "<b>\u2022  <font color='green'>/floodoptions</b></font>: displays the Flood Options.<br/>"
		+ "<b>\u2022  <font color='green'>/chatoptions</b></font>: displays the Chat Options.<br/>"
		+ "<b>\u2022  <font color='green'>/channeloptions</b></font>: displays the Channel Options.<br/>"
		+ "<b>\u2022  <font color='green'>/runoptions</b></font>: displays the Run Options.<br/>"
		+ "<b>\u2022  <font color='green'>/dboptions</b></font>: displays the Database Options.<br/>"
		+ "<b>\u2022  <font color='green'>/tiersoptions</b></font>: displays the Tiers Options.<br/>"
		+ "<b>\u2022  <font color='green'>/scriptoptions</b></font>: displays the Script Options.<br/>"
		+ "<b>\u2022  <font color='green'>/cmdsoptions</b></font>: displays the Commands Options.<br/>"
		+ "<b>\u2022  <font color='green'>/helpersoptions</b></font>: displays the Helpers Options.<br/>"
		+ "<b>\u2022  <font color='green'>/sessionoptions</b></font>: displays the Session Options.<br/>"
		+ "<b>\u2022  <font color='green'>/sysoptions</b></font>: displays the Sys Options.<br/>"
		+ "<b>\u2022  <font color='green'>/eventoptions</b></font>: displays the Event Options.<br/>"
		+ "<b>\u2022  <font color='green'>/execoptions</font></b>: displays the Executive Options.<br/>"
		+ "<b>\u2022  <font color='green'>/varoptions</font></b>: displays the Variable Options.<br/>"
		+ "<b>\u2022  <font color='green'>/regvaloptions</font></b>: displays the Registry Value Options.<br/>"
		+ "<b>\u2022  <font color='green'>/fileoptions</font></b>: displays the File Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, ownercommandsdisplay, channel);
	}
	commands[helpers.removespaces(AuthLevel2Name).toLowerCase() + "commands"] = function (src, channel, command){
		var administratorcommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(AuthLevel2Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/banoptions</b></font>: displays the Ban Options.<br/>"
		+ "<b>\u2022  <font color='green'>/supersilenceoptions</b></font>: displays the Super Silence Options.<br/>"		
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, administratorcommandsdisplay , channel); 
	}
	commands[helpers.removespaces(AuthLevel1Name).toLowerCase() + "commands"] = function (src, channel, command){
		var moderatorcommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(AuthLevel1Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/kickoptions</b></font>: displays the Kick Options.<br/>"
		+ "<b>\u2022  <font color='green'>/cpoptions</b></font>: displays the CP Options.<br/>"
		+ "<b>\u2022  <font color='green'>/muteoptions</b></font>: displays the Mute Options.<br/>"
		+ "<b>\u2022  <font color='green'>/silenceoptions</b></font>: displays the Silence Options.<br/>"
		+ "<b>\u2022  <font color='green'>/globalmsgoptions</b></font>: displays the Global Message Options.<br/>"
		+ "<b>\u2022  <font color='green'>/superimpoptions</b></font>: displays the Super Impersonation Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, moderatorcommandsdisplay, channel); 
	}
	commands[helpers.removespaces(AuthLevel0Name).toLowerCase() + "commands"] = function (src, channel, command){
		var usercommandsdisplay = border 
		+ "<h2>" + helpers.escapehtml(AuthLevel0Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/interactoptions</b></font>: displays the Interact Options.<br/>"
		+ "<b>\u2022  <font color='green'>/infooptions</b></font>: displays the Information Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, usercommandsdisplay, channel);
	}
	commands[helpers.removespaces(TourAuthLevel1Name).toLowerCase() + "commands"] = function (src, channel, command){
		var touradmincommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(TourAuthLevel1Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, touradmincommandsdisplay, channel); 
	}
	commands[helpers.removespaces(TourAuthLevel0Name).toLowerCase() + "commands"] = function (src, channel, command){
		var tourusercommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(TourAuthLevel0Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>tourauths</font></b>: displays the server's tournament auth list.<br/>"
		+ "<b>\u2022  <font color='green'>tours</font></b>: displays a list of on-going tournaments on the server.<br/>"  
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, tourusercommandsdisplay, channel); 
	}
	commands[helpers.removespaces(ChannelAuthLevel3Name).toLowerCase() + "commands"] = function (src, channel, command){
		var channelownercommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(ChannelAuthLevel3Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/cchatoptions</font></b>: displays the Channel Chat Options.<br/>"
		+ "<b>\u2022  <font color='green'>/cauthoptions</b></font>: displays the Channel Authority Options.<br/>"
		+ "<b>\u2022  <font color='grey'>/carboptions</b></font>: displays the Channel Arbitration Options.<br/>"
		+ "<b>\u2022  <font color='green'>/crunoptions</font></b>: displays the Channel Run Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, channelownercommandsdisplay, channel); 
	}
	commands[helpers.removespaces(ChannelAuthLevel2Name).toLowerCase() + "commands"] = function (src, channel, command){
		var channeladmincommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(ChannelAuthLevel2Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='grey'>/cbanoptions</font></b>: displays the Channel Ban Options.<br/>"
		+ "<b>\u2022  <font color='grey'>/csupersilenceoptions</font></b>: displays the Channel Super Silence Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, channeladmincommandsdisplay, channel); 
	}
	commands[helpers.removespaces(ChannelAuthLevel1Name).toLowerCase() + "commands"] = function (src, channel, command){
		var channelmodcommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(ChannelAuthLevel1Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/ckickoptions</font></b>: displays the Channel Kick  Options.<br/>"
		+ "<b>\u2022  <font color='grey'>/cmuteoptions</font></b>: displays the Channel Mute  Options.<br/>"
		+ "<b>\u2022  <font color='grey'>/csilenceoptions</font></b>: displays the Channel Silence  Options.<br/>"
		+ "<b>\u2022  <font color='green'>/cmsgoptions</font></b>: displays the Channel Message Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, channelmodcommandsdisplay, channel); 
	}
	commands[helpers.removespaces(ChannelAuthLevel0Name).toLowerCase() + "commands"] = function (src, channel, command){
		var channelusercommandsdisplay = border 
		+ "<h2>" + helpers.escapehtml(ChannelAuthLevel0Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/umsgoptions</font></b>: displays the User Message Options.<br/>"
		+ "<b>\u2022  <font color='green'>/cinfooptions</font></b>: displays the Channel Information Options.<br/>"
		+ "<b>\u2022  <font color='green'>/corridoroptions</font></b>: displays the Channel Corridor Options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, channelusercommandsdisplay, channel);
	}
	commands[helpers.removespaces(ChannelTourAuthLevel1Name).toLowerCase() + "commands"] = function(src, channel, command){
		var channeltouradmincommandsdisplay = border
		+ "<h2>" + helpers.escapehtml(ChannelTourAuthLevel1Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>/touroptions</font></b>: displays the Tournament options.<br/>"
		+ "<b>\u2022  <font color='green'>/tourmatchoptions</font></b>: displays the Tournament Match options.<br/>"
		+ "<b>\u2022  <font color='green'>/tourplayeroptions</font></b>: displays the Tournament Player options.<br/>"
		+ "<b>\u2022  <font color='green'>/tourbattleoptions</font></b>: displays the Tournament Battle options.<br/>"
		+ "<br/>"
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, channeltouradmincommandsdisplay, channel);
	}
	commands[helpers.removespaces(ChannelTourAuthLevel0Name).toLowerCase() + "commands"] = function(src, channel, command){
		var channeltourusercommandsdisplay = border +
		"<h2>" + helpers.escapehtml(ChannelTourAuthLevel0Name) + " Commands</h2>"
		+ "<br/>"
		+ typecommands + "<br/>"
		+ "<br/>"
		+ "<b>\u2022  <font color='green'>ctourauths</font></b>: displays the channel's tournament auth list.<br/>" 
		+ "<b>\u2022  <font color='green'>join</font></b>: allows you to join a tournament.<br/>"
		+ "<b>\u2022  <font color='green'>leave</font></b>: allows you to leave a tournament.<br/>"
		+ "<b>\u2022  <font color='green'>viewtour</font></b>: displays the basic tournament information.<br/>"
		+ "<b>\u2022  <font color='green'>viewround</font></b>: displays the pairings for the round or players signed-up in the sign-up phase.<br/>"
		+ "<br/>" 
		+ "<timestamp/><br/>"
		+ border;
		sys.sendHtmlMessage(src, channeltourusercommandsdisplay, channel);
	}
	commands[helpers.removespaces(AuthLevel3Name).toLowerCase()] = function(src, channel, command){
		if (sys.auth(src) < 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (sys.dbAuth(playername) == 3){
			sys.sendHtmlMessage(src, playername + " is already " + AuthLevel3Name + ".", channel);
			return;
		}
		var playernumber = sys.id(playername);
		if (playernumber === undefined){
			sys.changeDbAuth(playername, 3);
		}
		else {
			sys.changeAuth(playernumber, 3);
		}
		var srcname = sys.name(src);
		sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>" + playername + " was made " + helpers.escapehtml(AuthLevel3Name) + " by " + srcname + "!</b></font>");
	}
	commands[helpers.removespaces(AuthLevel2Name).toLowerCase()] = function(src, channel, command){
		if (sys.auth(src) < 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (sys.dbAuth(playername) == 2){
			sys.sendHtmlMessage(src, playername + " is already " + AuthLevel2Name + ".", channel);
			return;
		}
		var playernumber = sys.id(playername);
		if (playernumber === undefined){
			sys.changeDbAuth(playername, 2);
		}
		else {
			sys.changeAuth(playernumber, 2);
		}
		var srcname = sys.name(src);
		sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>" + playername + " was made " + helpers.escapehtml(AuthLevel2Name) + " by " + srcname + "!</b></font>");
	}
	commands[helpers.removespaces(AuthLevel1Name).toLowerCase()] = function(src, channel, command){
		if (sys.auth(src) < 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (sys.dbAuth(playername) == 1){
			sys.sendHtmlMessage(src, playername + " is already " + AuthLevel1Name + ".", channel);
			return;
		}
		var playernumber = sys.id(playername);
		if (playernumber === undefined){
			sys.changeDbAuth(playername, 1);
		}
		else {
			sys.changeAuth(playernumber, 1);
		}
		var srcname = sys.name(src);
		sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>" + playername + " was made " + helpers.escapehtml(AuthLevel1Name) + " by " + srcname + "!</b></font>");
	}
	commands[helpers.removespaces(AuthLevel0Name).toLowerCase()] =  function(src, channel, command){
		if (sys.auth(src) < 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (sys.dbAuth(playername) == 0){
			sys.sendHtmlMessage(src, playername + " is already " + AuthLevel0Name + ".", channel);
			return;
		}
		var playernumber = sys.id(playername);
		if (playernumber === undefined){
			sys.changeDbAuth(playername, 0);
		}
		else {
			sys.changeAuth(playernumber, 0);
		}
		var srcname = sys.name(src);
		sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>" + playername + " was made " + helpers.escapehtml(AuthLevel0Name) + " by " + srcname + ".</b></font>");
	}
 	commands[helpers.removespaces(TourAuthLevel1Name).toLowerCase()] = function (src, channel, command){
		if (sys.auth(src) < 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		var tourauthindex, srcname = sys.name(src);
		for (tourauthindex in tourauth){
			if (tourauth[tourauthindex] == command[1].toLowerCase()){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is already a " + helpers.escapehtml(TourAuthLevel1Name) + ".</i>", channel);
				return;
			}
		}
		if(helpers.memberscheck(command[1])){
			var player = sys.id(command[1]);
			if (player !== undefined){
				playersonline[player].tourauth = 1;
			}
			tourauth.push(command[1].toLowerCase());
			sys.saveVal("Authority_Options_TourAuthLevel1List", JSON.stringify(tourauth));
			sys.sendHtmlAll("<timestamp/><font color='blueviolet'><b>" + members[command[1].toLowerCase()] + " has been made a " + helpers.escapehtml(TourAuthLevel1Name) + " by " + srcname + "!</b></font>");
			return;
		}
		sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to make " + command[1] + " a " + helpers.escapehtml(TourAuthLevel1Name) + " because they do not exist in the member database.</i>", channel);
	}
	commands[helpers.removespaces(TourAuthLevel0Name).toLowerCase()] = function (src, channel, command){
		if (sys.auth(src) < 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		var tourauthindex, srcname = sys.name(src), tourauthsmessage;
		for (tourauthindex in tourauth){
			if (tourauth[tourauthindex] == command[1].toLowerCase()){
				if (members[command[1].toLowerCase()] !== undefined){
					tourauthsmessage = "<timestamp/><font color='blueviolet'><b>" + members[command[1].toLowerCase()] + " has been made a " + helpers.escapehtml(TourAuthLevel0Name) + " by " + srcname + ".</b></font>";
				}
				else { 
					tourauthsmessage = "<timestamp/><font color='blueviolet'><b>" + tourauth[tourauthindex] + " has been made a " + helpers.escapehtml(TourAuthLevel0Name) + " by " + srcname + ".</b></font>";
				}
				var player = sys.id(tourauth[tourauthindex]);
				if (player !== undefined){
					playersonline[player].tourauth = 0;
				}
				sys.sendHtmlAll(tourauthsmessage);
				tourauth.splice(tourauthindex, 1);
				sys.saveVal("Authority_Options_TourAuthLevel1List", JSON.stringify(tourauth));
				return;
			}
		}
		if(helpers.memberscheck(command[1])){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " is already a " + helpers.escapehtml(TourAuthLevel0Name) + ".</i>", channel);
			return;
		}
	}
	commands[helpers.removespaces(ChannelAuthLevel3Name).toLowerCase()] =  function(src, channel, command){
		var srcname = sys.name(src), channelname = sys.channel(channel);
		if (sys.auth(src) < 3 && playersonline[src].channelauth[channel] != 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (channelsonline[channel].owners.indexOf(playername.toLowerCase()) != -1){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, " + playername + " is already " + ChannelAuthLevel3Name + "</i>.", channel);
			return;
		}
		if (channel != 0 && channelsregistered[channelname.toLowerCase()] === undefined){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, this channel is not registered. </i>", channel);
			return;
		}
		if (channelsonline[channel].admins.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].admins.splice(channelsonline[channel].admins.indexOf(playername.toLowerCase()), 1);
		}
		if (channelsonline[channel].mods.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].mods.splice(channelsonline[channel].mods.indexOf(playername.toLowerCase()), 1);
		}
		channelsonline[channel].owners.push(playername.toLowerCase());
		var player = sys.id(playername);
		if (player !== undefined){
			playersonline[player].channelauth[channel] = 3;
		}
		if (channel != 0){
			channelsregistered[channelname.toLowerCase()].owners = channelsonline[channel].owners;
			channelsregistered[channelname.toLowerCase()].admins = channelsonline[channel].admins;
			channelsregistered[channelname.toLowerCase()].mods = channelsonline[channel].mods;
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
		}
		else {
			channelsregistered["|main|"].owners = channelsonline[channel].owners;
			channelsregistered["|main|"].admins = channelsonline[channel].admins;
			channelsregistered["|main|"].mods = channelsonline[channel].mods;
			sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
		}
		sys.sendHtmlAll("<timestamp/><font color='indigo'><b>" + playername + " was made " + helpers.escapehtml(ChannelAuthLevel3Name) + " of " + channelname +  " by " + srcname + ".</b></font>", channel);
	}
	commands[helpers.removespaces(ChannelAuthLevel2Name).toLowerCase()] =  function(src, channel, command){
		var srcname = sys.name(src), channelname = sys.channel(channel);
		if (sys.auth(src) < 3 && playersonline[src].channelauth[channel] != 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (channelsonline[channel].admins.indexOf(playername.toLowerCase()) != -1){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, " + playername + " is already " + ChannelAuthLevel2Name + "</i>.", channel);
			return;
		}
		if (channel != 0 && channelsregistered[channelname.toLowerCase()] === undefined){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, this channel is not registered. </i>", channel);
			return;
		}
		if (channelsonline[channel].owners.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].owners.splice(channelsonline[channel].owners.indexOf(playername.toLowerCase()), 1);
		}
		if (channelsonline[channel].mods.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].mods.splice(channelsonline[channel].mods.indexOf(playername.toLowerCase()), 1);
		}
		channelsonline[channel].admins.push(playername.toLowerCase());
		var player = sys.id(playername);
		if (player !== undefined){
			playersonline[player].channelauth[channel] = 2;
		}
		if (channel != 0){
			channelsregistered[channelname.toLowerCase()].owners = channelsonline[channel].owners;
			channelsregistered[channelname.toLowerCase()].admins = channelsonline[channel].admins;
			channelsregistered[channelname.toLowerCase()].mods = channelsonline[channel].mods;
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
		}
		else {
			channelsregistered["|main|"].owners = channelsonline[channel].owners;
			channelsregistered["|main|"].admins = channelsonline[channel].admins;
			channelsregistered["|main|"].mods = channelsonline[channel].mods;
			sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
		}
		sys.sendHtmlAll("<timestamp/><font color='indigo'><b>" + playername + " was made " + helpers.escapehtml(ChannelAuthLevel2Name) + " of " + channelname +  " by " + srcname + ".</b></font>", channel);
	}
	commands[helpers.removespaces(ChannelAuthLevel1Name).toLowerCase()] =  function(src, channel, command){
		var srcname = sys.name(src), channelname = sys.channel(channel);
		if (sys.auth(src) < 3 && playersonline[src].channelauth[channel] != 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (channelsonline[channel].mods.indexOf(playername.toLowerCase()) != -1){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, " + playername + " is already " + ChannelAuthLevel3Name + "</i>.", channel);
			return;
		}
		if (channel != 0 && channelsregistered[channelname.toLowerCase()] === undefined){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, this channel is not registered. </i>", channel);
			return;
		}
		if (channelsonline[channel].owners.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].owners.splice(channelsonline[channel].owners.indexOf(playername.toLowerCase()), 1);
		}
		if (channelsonline[channel].admins.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].admins.splice(channelsonline[channel].admins.indexOf(playername.toLowerCase()), 1);
		}
		channelsonline[channel].mods.push(playername.toLowerCase());
		var player = sys.id(playername);
		if (player !== undefined){
			playersonline[player].channelauth[channel] = 1;
		}
		if (channel != 0){
			channelsregistered[channelname.toLowerCase()].owners = channelsonline[channel].owners;
			channelsregistered[channelname.toLowerCase()].admins = channelsonline[channel].admins;
			channelsregistered[channelname.toLowerCase()].mods = channelsonline[channel].mods;
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
		}
		else {
			channelsregistered["|main|"].owners = channelsonline[channel].owners;
			channelsregistered["|main|"].admins = channelsonline[channel].admins;
			channelsregistered["|main|"].mods = channelsonline[channel].mods;
			sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
		}
		sys.sendHtmlAll("<timestamp/><font color='indigo'><b>" + playername + " was made " + helpers.escapehtml(ChannelAuthLevel1Name) + " of " + channelname +  " by " + srcname + ".</b></font>", channel);
	}
	commands[helpers.removespaces(ChannelAuthLevel0Name).toLowerCase()] =  function(src, channel, command){
		var srcname = sys.name(src), channelname = sys.channel(channel), playername;
		if (sys.auth(src) < 3 && playersonline[src].channelauth[channel] != 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (members[command[1].toLowerCase()] !== undefined){
			playername = members[command[1].toLowerCase()];
		}
		else { 
			playername = command[1];
		}
		if (channelsonline[channel].owners.indexOf(playername.toLowerCase()) == -1 && channelsonline[channel].admins.indexOf(playername.toLowerCase()) == -1 && channelsonline[channel].mods.indexOf(playername.toLowerCase()) == -1){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, " + playername + " is already " + ChannelAuthLevel0Name + "</i>.", channel);
			return;
		}
		if (channel != 0 && channelsregistered[channelname.toLowerCase()] === undefined){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, this channel is not registered. </i>", channel);
			return;
		}
		if (channelsonline[channel].owners.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].owners.splice(channelsonline[channel].owners.indexOf(playername.toLowerCase()), 1);
		}
		if (channelsonline[channel].admins.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].admins.splice(channelsonline[channel].admins.indexOf(playername.toLowerCase()), 1);
		}
		if (channelsonline[channel].mods.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].mods.splice(channelsonline[channel].mods.indexOf(playername.toLowerCase()), 1);
		}
		var player = sys.id(playername);
		if (player !== undefined){
			playersonline[player].channelauth[channel] = 0;
		}
		if (channel != 0){
			channelsregistered[channelname.toLowerCase()].owners = channelsonline[channel].owners;
			channelsregistered[channelname.toLowerCase()].admins = channelsonline[channel].admins;
			channelsregistered[channelname.toLowerCase()].mods = channelsonline[channel].mods;
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
		}
		else {
			channelsregistered["|main|"].owners = channelsonline[channel].owners;
			channelsregistered["|main|"].admins = channelsonline[channel].admins;
			channelsregistered["|main|"].mods = channelsonline[channel].mods;
			sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
		}
		sys.sendHtmlAll("<timestamp/><font color='indigo'><b>" + playername + " was made " + helpers.escapehtml(ChannelAuthLevel0Name) + " of " + channelname +  " by " + srcname + ".</b></font>", channel);
	}
	commands[helpers.removespaces(ChannelTourAuthLevel1Name).toLowerCase()] =  function(src, channel, command){
		var srcname = sys.name(src), channelname = sys.channel(channel);
		if (sys.auth(src) < 3 && playersonline[src].channelauth[channel] != 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (helpers.memberscheck(command[1]) != true){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		var playername = members[command[1].toLowerCase()];
		if (channelsonline[channel].touradmins.indexOf(playername.toLowerCase()) != -1){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, " + playername + " is already " + ChannelTourAuthLevel1Name + "</i>.", channel);
			return;
		}
		if (channel != 0 && channelsregistered[channelname.toLowerCase()] === undefined){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, this channel is not registered. </i>", channel);
			return;
		}
		channelsonline[channel].touradmins.push(playername.toLowerCase());
		var player = sys.id(playername);
		if (player !== undefined){
			playersonline[player].channeltourauth[channel] = 1;
		}
		if (channel != 0){
			channelsregistered[channelname.toLowerCase()].touradmins = channelsonline[channel].touradmins;
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
		}
		else {
			channelsregistered["|main|"].touradmins = channelsonline[channel].touradmins;
			sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
		}
		sys.sendHtmlAll("<timestamp/><font color='indigo'><b>" + playername + " was made " + helpers.escapehtml(ChannelTourAuthLevel1Name) + " of " + channelname +  " by " + srcname + ".</b></font>", channel);
	}
	commands[helpers.removespaces(ChannelTourAuthLevel0Name).toLowerCase()] =  function(src, channel, command){
		var srcname = sys.name(src), channelname = sys.channel(channel), playername;
		if (sys.auth(src) < 3 && playersonline[src].channelauth[channel] != 3){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (members[command[1].toLowerCase()] !== undefined){
			playername = members[command[1].toLowerCase()];
		}
		else { 
			playername = command[1];
		}
		if (channelsonline[channel].touradmins.indexOf(playername.toLowerCase()) == -1){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, " + playername + " is already " + ChannelAuthLevel0Name + "</i>.", channel);
			return;
		}
		if (channel != 0 && channelsregistered[channelname.toLowerCase()] === undefined){
			sys.sendHtmlMessage(src, "<timestamp/><i> Sorry, this channel is not registered. </i>", channel);
			return;
		}
		if (channelsonline[channel].touradmins.indexOf(playername.toLowerCase()) != -1){
			channelsonline[channel].touradmins.splice(channelsonline[channel].touradmins.indexOf(playername.toLowerCase()), 1);
		}
		var player = sys.id(playername);
		if (player !== undefined){
			playersonline[player].channeltourauth[channel] = 0;
		}
		if (channel != 0){
			channelsregistered[channelname.toLowerCase()].touradmins = channelsonline[channel].touradmins;
			sys.saveVal("Registered_Channel_" + channelname.toLowerCase(), JSON.stringify(channelsregistered[channelname.toLowerCase()]));
		}
		else {
			channelsregistered["|main|"].touradmins = channelsonline[channel].touradmins;
			sys.saveVal("Main_Channel", JSON.stringify(channelsregistered["|main|"]));
		}
		sys.sendHtmlAll("<timestamp/><font color='indigo'><b>" + playername + " was made " + helpers.escapehtml(ChannelTourAuthLevel0Name) + " of " + channelname +  " by " + srcname + ".</b></font>", channel);
	}
	commands["switch"] = function (src, channel, command){
		if (!helpers.tourpermission(src, channel)){
			helpers.failpermissionmessage(src, channel, command[0]);
			return;
		}
		if (tour[channel].tourmode == 0){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to switch players because a tournament is not currently running in this channel.</i>", channel);
			return;
		}
		var switchplayer1 = command[1].toLowerCase(), switchplayer2 = command[2].toLowerCase();
		if (switchplayer1 == switchplayer2){
			sys.sendHtmlMessage(src, "Sorry, you are unable to switch the players because you have named the same player twice.", channel);
			return;
		}
		if (!helpers.memberscheck(switchplayer1) && switchplayer1 != "|bye|"){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[1] + " does not exist in the members database.</i>", channel);
			return;
		}
		if(!helpers.memberscheck(switchplayer2) && switchplayer2 != "|bye|"){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, " + command[2] + " does not exist in the members database.</i>", channel);
			return;
		}
		if (tour[channel].tourmembers.indexOf(switchplayer1) == -1 && tour[channel].tourmembers.indexOf(switchplayer2) == -1){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to switch the players because both players are not in the tournament.</i>", channel);
			return;
		}
		var srcname = sys.name(src);
		if (tour[channel].tourmembers.indexOf(switchplayer1) != -1 && tour[channel].tourmembers.indexOf(switchplayer2) != -1){
			if (tour[channel].tourbattlers.indexOf(switchplayer1) != -1){
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(switchplayer1), 1);
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(helpers.opponentof(switchplayer1)), 1);
			}
			if (tour[channel].tourbattlers.indexOf(switchplayer2) != -1){
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(switchplayer2), 1);
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(helpers.opponentof(switchplayer2)), 1);
			}
			if (tour[channel].tourlosers.indexOf(switchplayer1) != -1 && tour[channel].tourlosers.indexOf(switchplayer2) == -1){
				tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(switchplayer1), 1, switchplayer2);
			}
			else {
				if (tour[channel].tourlosers.indexOf(switchplayer1) == -1 && tour[channel].tourlosers.indexOf(switchplayer2) != -1){
					tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(switchplayer2), 1, switchplayer1);
				}				
			}
			if (tour[channel].tourwinners.indexOf(switchplayer1) != -1 && tour[channel].tourwinners.indexOf(switchplayer2) == -1){
				tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(switchplayer1), 1, switchplayer2);
			}
			else {
				if (tour[channel].tourwinners.indexOf(switchplayer1) == -1 && tour[channel].tourwinners.indexOf(switchplayer2) != -1){
					tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(switchplayer2), 1, switchplayer1);
				}				
			}
			var switchplayerindex1 = helpers.tourmembersnumber(switchplayer1, channel), switchplayerindex2 = helpers.tourmembersnumber(switchplayer2, channel);
			tour[channel].tourmembers[switchplayerindex1] = switchplayer2;
			tour[channel].tourmembers[switchplayerindex2] = switchplayer1;
			var player1 = switchplayer1 == "|bye|" ? "|bye|" : members[switchplayer1];
			var player2 = switchplayer2 == "|bye|" ? "|bye|" : members[switchplayer2];
			var switchmessage = border2 + "<br/>"
			+ "<timestamp/><font color='mediumseagreen'><b>" + srcname + " has switched two tournament spots!</b></font><br/>"
			+ "<b>" + player1 + " has been switched with " + player2 + "!</b><br/>"
			+ border2
			sys.sendHtmlAll(switchmessage, channel);
			return;
		}
		if (tour[channel].tourmembers.indexOf(switchplayer1) != -1 && tour[channel].tourmembers.indexOf(switchplayer2) == -1){
			if (tour[channel].tourbattlers.indexOf(switchplayer1) != -1){
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(switchplayer1), 1);
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(helpers.opponentof(switchplayer1)), 1);
			}
			if (tour[channel].tourlosers.indexOf(switchplayer1) != -1){
				tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(switchplayer1), 1, switchplayer2);
			}
			if (tour[channel].tourwinners.indexOf(switchplayer1) != -1){
				tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(switchplayer1), 1, switchplayer2);
			}
			tour[channel].tourmembers[helpers.tourmembersnumber(switchplayer1, channel)] = switchplayer2;
			var player1 = switchplayer1 == "|bye|" ? "|bye|" : members[switchplayer1];
			var player2 = switchplayer2 == "|bye|" ? "|bye|" : members[switchplayer2];
			var switchmessage = border2 + "<br/>"
			+ "<timestamp/><font color='mediumseagreen'><b>" + srcname + " has switched a tournament spot!</b></font><br/>"
			+ "<b>" + player1 + " has been switched out for " + player2 + "!</b><br/>"
			+ border2
			sys.sendHtmlAll(switchmessage, channel);
			return;
		}
		if (tour[channel].tourmembers.indexOf(switchplayer1) == -1 && tour[channel].tourmembers.indexOf(switchplayer2) != -1){
			if (tour[channel].tourbattlers.indexOf(switchplayer2) != -1){
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(switchplayer2), 1);
				tour[channel].tourbattlers.splice(tour[channel].tourbattlers.indexOf(helpers.opponentof(switchplayer2)), 1);
			}
			if (tour[channel].tourlosers.indexOf(switchplayer2) != -1){
				tour[channel].tourlosers.splice(tour[channel].tourlosers.indexOf(switchplayer2), 1, switchplayer1);
			}
			if (tour[channel].tourwinners.indexOf(switchplayer2) != -1){
				tour[channel].tourwinners.splice(tour[channel].tourwinners.indexOf(switchplayer2), 1, switchplayer1);
			}
			tour[channel].tourmembers[helpers.tourmembersnumber(switchplayer2, channel)] = switchplayer1;
			var player1 = switchplayer1 == "|bye|" ? "|bye|" : members[switchplayer1];
			var player2 = switchplayer2 == "|bye|" ? "|bye|" : members[switchplayer2];
			var switchmessage = border2 + "<br/>"
			+ "<timestamp/><font color='green'><b>" + srcname + " has switched a tournament spot!</b></font><br/>"
			+ "<b>" + player1 + " has been switched in for " + player2 + "!</b><br/>"
			+ border2
			sys.sendHtmlAll(switchmessage, channel);
		} 
	}
	var messagecommandsindex;
	for (messagecommandsindex in messagecommands){
		commands[messagecommandsindex] = new Function('src', 'channel', 'command', 'sys.sendHtmlMessage(src, "' + border + '<h2>' + messagecommandsindex.replace(/[a-z]/, String(/[a-z]/.exec(messagecommandsindex)).toUpperCase()) + '</h2>' + messagecommands[messagecommandsindex] + '<br/><br/><timestamp/><br/>' + border + '" , channel);');
	}
	commandassists = new Object();
	commandassists = {
		cp: function(src, message, channel){
			if (message.toLowerCase() == "*exit" || message[0] == "/" || message[0] == "!"){
				sys.stopEvent();
				delete playersonline[src].commandassist;
				delete playersonline[src].cp;
				sys.sendHtmlMessage(src, border + "<br/><timestamp/><b><font color='blue'> The control panel has been exited.</font></b><br/>" + border + "<br/>" + border4 , channel);
				return;
			}
			if (message.substr(0,2).toLowerCase() == "**"){
				sys.stopEvent();
				sys.sendHtmlMessage(src, border4, channel);
				commands.cp(src, channel, ["cp", message.substr(2)]);
				return;
			}
			if (message.toLowerCase() == "*kick"){
				sys.stopEvent();
				commands.kick(src, channel, ["kick", playersonline[src].cp]);
				return;
			}
			if (message.toLowerCase() == "*ban"){
				sys.stopEvent();
				commands.ban(src, channel, ["ban", playersonline[src].cp]);
				return;
			}
			if (message.toLowerCase() == "*unban"){
				sys.stopEvent();
				commands.unban(src, channel, ["unban", playersonline[src].cp]);
				return;
			}
			if (message.toLowerCase() == "*mute"){
				sys.stopEvent();
				commands.mute(src, channel, ["mute", playersonline[src].cp]);
				return;
			}
			if (message.toLowerCase() == "*unmute"){
				sys.stopEvent();
				commands.unmute(src, channel, ["unmute", playersonline[src].cp]);
				return;
			}
			if (message.toLowerCase() == "*clearpass"){
				sys.stopEvent();
				commands.clearpass(src, channel, ["clearpass", playersonline[src].cp]);
				return;
			}
			if (message.toLowerCase() == "*ipkick"){
				sys.stopEvent();
				commands.ipkick(src, channel, ["ipkick", sys.dbIp(playersonline[src].cp)]);
				return;
			}				
		}
	}
	commanddescriptions = new Object();
	commanddescriptions = {
	}
	sys.sendHtmlAll("<timestamp/><b>Script Check: </b><font color='green'>OK</font>");
}
).call(null);

({
	serverStartUp: function(){
			starttime = new Date();
	}

	,

	serverShutDown: function(){
	}

	,

	step: function(){
		if (floodtime != "off"){
			var playersindex;
			for (playersindex in floodplayers){
				playersonline[floodplayers[playersindex]].floodcounttimer+= 1;
				if (playersonline[floodplayers[playersindex]].floodcounttimer == floodtime){
					playersonline[floodplayers[playersindex]].floodcount-= Number(messageallowance);
					playersonline[floodplayers[playersindex]].floodcounttimer = 0;
					if (playersonline[floodplayers[playersindex]].floodcount <= 0){
						playersonline[floodplayers[playersindex]].floodcount = 0;
						floodplayers.splice(playersindex, 1);
					}
				}
			}
		}
	}

	,

	beforeNewMessage: function(message){
	}

	,

	afterNewMessage: function(message){
		if(message.substr(0, 33) == "The name of the server changed to"){
			servername = message.substring(34, message.lastIndexOf("."));
			return;
		}
		if (message.substr(0, 17) == "The server is now"){
			status = message.substring(17, message.lastIndexOf("."));
			return;
		}
	}

	,

	beforeLogIn: function (src){
	}

	,

	afterLogIn: function (src){
		var srcip = sys.ip(src);
		if (!open && srcip != "127.0.0.1" ){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, the server is closed to player connections at the moment.</i>"); 
			sys.callQuickly("sys.kick(" + src + ");", 200);
			return;
		}
		var rangebanexindex;
		for (rangebanexindex in rangebanexlist){
			if (rangebanexindex == srcip.substr(0,rangebanexindex.length)){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your ip range(" + rangebanexindex + ") has been banned.</i>"); 
				sys.callQuickly("sys.kick(" + src + ");", 200);
				return;
			}
		}
		var srcname = sys.name(src);
		if (/[\u0410\u0430\u0412\u0415\u0435\u0405\u0455\u0406\u0456\u0408\u0458\u041C\u041D\u041E\u043E\u0420\u0440\u0421\u0441\u0422\u0443\u0425\u0445\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03BF\u03A1\u03A4\u03A5\u03A7]/.test(srcname) && quasienglish == "off"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to login because your name contains letters that resemble english ones but are different.</i>"); 
				sys.callQuickly("sys.kick(" + src + ");", 200);
		}
		helpers.owneradd(src);
		helpers.membersadd(srcname);
		playersonline[src] = new Object();
		playersonline[src].name = srcname;
		playersonline[src].starttime = new Date();
		playersonline[src].channelauth = new Object();
		playersonline[src].channeltourauth = new Object();
		helpers.setchannelauth(src, 0);	
		playersonline[src].tourauth = 0;
		if (tourauth.indexOf(srcname.toLowerCase()) != - 1){
			playersonline[src].tourauth = 1;
		}	
		playersonline[src].floodcount = 0;
		playersonline[src].floodcounttimer = 0;
		helpers.aliasesips(src, srcname, srcip);
		if (typeof(starttime) != "undefined"){
			var runtime = new Date() - starttime;
			runtime = helpers.converttime(runtime);
			sys.sendHtmlMessage (src, "<b><font color='blueviolet'>Server Run Time: </font></b>" + runtime);
		}
		if (sys.numPlayers() > playerrecord){
			playerrecord = sys.numPlayers();
			sys.saveVal("Player_Record", playerrecord);
		}
		sys.sendHtmlMessage (src, "<b><font color='red'>Number of Players Online: </font></b><i>" + sys.numPlayers() + " out of a record maximum of " + playerrecord + "</i>.");
		sys.sendHtmlMessage (src,"<br/><timestamp/><b>Type: <font color='green'>/Commands</font> </b> into a channel's main chat to view a list of commands.<br/>");
		if (silence > 0){
			sys.sendHtmlMessage(src, border + "<br/><timestamp/><b>All players below " + global["AuthLevel" + silence + "Name"] + " have been silenced by " + silencer + ".</b><br/>" + border);
		}
	}

	,

	beforeChannelJoin: function(src, channel){
	}

	,

	afterChannelJoin: function(src, channel){
		if (servertopic.toLowerCase() != "off"){
			sys.sendHtmlMessage(src, "<font color='maroon'><b>Server Topic: </b></font> " + servertopic, channel);
		}
		if (global.channelsonline[channel] != undefined){
			if (channelsonline[channel].topic != "off"){
				sys.sendHtmlMessage(src, "<font color='indigo'><b>Channel Topic: </b></font> " + channelsonline[channel].topic, channel);
			}
		}
		if (playersonline[src] !== undefined){
			helpers.setchannelauth(src, channel);
		}
		if (tour[channel].tourmode == 1){
			receiver = src;
			helpers.tourdisplay(1, channel);
			return;
		}
		if (tour[channel].tourmode == 2){
			receiver = src;
			helpers.tourdisplay(2, channel);
			return;
		}
	}

	,

	beforeChannelLeave: function(src, channel){
	}

	,

	afterChannelLeave: function(src, channel){
	}

	,

	beforeLogOut: function(src){
		helpers.ownerremove(src);
		if (floodplayers.indexOf(src) != -1){
			floodplayers.splice(floodplayers.indexOf(src), 1);
		}
		if (global.playersonline[src] != undefined){
			delete playersonline[src];
		}
	}

	,

	afterLogOut: function(src){
	}

	,

	beforeChangeTeam: function(src){
		helpers.ownerremove(src);
	}

	,

	afterChangeTeam: function (src){
		var srcname = sys.name(src), srcip = sys.ip(src);
		if (/[\u0410\u0430\u0412\u0415\u0435\u0405\u0455\u0406\u0456\u0408\u0458\u041C\u041D\u041E\u043E\u0420\u0440\u0421\u0441\u0422\u0443\u0425\u0445\u0391\u0392\u0395\u0396\u0397\u0399\u039A\u039C\u039D\u039F\u03BF\u03A1\u03A4\u03A5\u03A7]/.test(srcname) && quasienglish == "off"){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you were disconnected because your name contains letters that resemble english ones but are different.</i>"); 
				sys.callQuickly("sys.kick(" + src + ");", 200);
		}
		helpers.owneradd(src);
		helpers.membersadd(srcname);
		if (global.playersonline[src] != undefined){
			playersonline[src].name = srcname;
		}
		helpers.aliasesips(src, srcname, srcip);
		var channelsindex, channels = sys.channelsOfPlayer(src);
		for (channelsindex in channels){
			helpers.setchannelauth(src, channels[channelsindex]);
		}
		playersonline[src].tourauth = 0;
		if (tourauth.indexOf(srcname.toLowerCase()) != - 1){
			playersonline[src].tourauth = 1;
		}	
	}

	,

	beforeChangeTier: function(src, oldtier, newtier){
	}

	,

	afterChangeTier: function(src, oldtier, newtier){
	}

	,

	beforeChannelCreated: function (channel, channelname, creator){
	}

	,

	afterChannelCreated: function (channel, channelname, creator){
		if (creator == 0){
			return;
		}
		if (helpers.channelcount() > channelrecord){
			channelrecord = helpers.channelcount();
			sys.saveVal("Channel_Record", channelrecord);
		}
		var creatorname = sys.name(creator);
		channelsonline[channel] = new Object();
		channelsonline[channel].starttime = new Date();
		channelsonline[channel].stay = "off";
		channelsonline[channel].topic = " Welcome to " + channelname + "!";
		channelsonline[channel].ReadyForTour = "off";
		channelsonline[channel].ForceTourBattles = "on";
		channelsonline[channel].AutoStartBattles = "on";
		channelsonline[channel].EnforceTourClauses = "off";
		channelsonline[channel].combinecharacters = "off";
		channelsonline[channel].reversecharacters = "off";			
		channelsonline[channel].owners = new Array();
		channelsonline[channel].owners.push(creatorname.toLowerCase());
		channelsonline[channel].admins = new Array();
		channelsonline[channel].mods = new Array();
		channelsonline[channel].touradmins = new Array();
		tour[channel] = new Object();
		tour[channel].tourmode = 0;
		try {
			if (registeredchannels.indexOf(channelname.toLowerCase()) != -1){
				channelsregistered[channelname.toLowerCase()] = JSON.parse(sys.getVal("Registered_Channel_" + channelname.toLowerCase()));
			}
		}
		catch(error){
			print("Error: channelregistered[" + channelname.toLowerCase() + "] is unable to be set due to a JSON parse error.");
		}		
		if (channelsregistered[channelname.toLowerCase()] === undefined){
			var tempownermessage = "<timestamp/><b>" + creatorname + " has been made temp " + ChannelAuthLevel3Name + " of " + channelname + " by the server!</b>";
			sys.callQuickly("sys.sendHtmlAll('" + tempownermessage + "'," + channel + ")", 200);
		}
		else{
			if (channelsregistered[channelname.toLowerCase()].stay != undefined){
				channelsonline[channel].stay = channelsregistered[channelname.toLowerCase()].stay;
			}
			if (channelsregistered[channelname.toLowerCase()].topic != undefined){
				channelsonline[channel].topic = channelsregistered[channelname.toLowerCase()].topic;
			}
			if (channelsregistered[channelname.toLowerCase()].ReadyForTour != undefined){
				channelsonline[channel].ReadyForTour = channelsregistered[channelname.toLowerCase()].ReadyForTour;
			}
			if (channelsregistered[channelname.toLowerCase()].ForceTourBattles != undefined){
				channelsonline[channel].ForceTourBattles = channelsregistered[channelname.toLowerCase()].ForceTourBattles;
			}
			if (channelsregistered[channelname.toLowerCase()].AutoStartBattles != undefined){
				channelsonline[channel].AutoStartBattles = channelsregistered[channelname.toLowerCase()].AutoStartBattles;
			}
			if (channelsregistered[channelname.toLowerCase()].EnforceTourClauses != undefined){
				channelsonline[channel].EnforceTourClauses = channelsregistered[channelname.toLowerCase()].EnforceTourClauses;
			}
			if (channelsregistered[channelname.toLowerCase()].combinecharacters != undefined){
				channelsonline[channel].combinecharacters = channelsregistered[channelname.toLowerCase()].combinecharacters;
			}
			if (channelsregistered[channelname.toLowerCase()].reversecharacters != undefined){
				channelsonline[channel].reversecharacters = channelsregistered[channelname.toLowerCase()].reversecharacters;
			}
			channelsonline[channel].owners = channelsregistered[channelname.toLowerCase()].owners;
			if (channelsregistered[channelname.toLowerCase()].admins != undefined){
				channelsonline[channel].admins = channelsregistered[channelname.toLowerCase()].admins;
			}
			if (channelsregistered[channelname.toLowerCase()].mods != undefined){
				channelsonline[channel].mods = channelsregistered[channelname.toLowerCase()].mods;
			}
			if (channelsregistered[channelname.toLowerCase()].touradmins != undefined){
				channelsonline[channel].touradmins = channelsregistered[channelname.toLowerCase()].touradmins;
			}
		}
	}

	,

	beforeChannelDestroyed: function(channel){
			if (channelsonline[channel].stay == "on"){
				sys.stopEvent();
				return;
			}
			var channelname = sys.channel(channel);
			if (channelsonline[channel] != undefined){
				delete channelsonline[channel];
			}
			if (channelsregistered[channelname.toLowerCase()] != undefined){
				delete channelsregistered[channelname.toLowerCase()];
			}
			if (tour[channel] != undefined){
				delete tour[channel];
			}
	}

	,

	afterChannelDestroyed: function(channel){
	}

	,

	beforeChatMessage: function(src,message, channel){
		var srcname = sys.name(src);
		if (playersonline[src] != undefined){
			if (floodplayers.indexOf(src) == -1){
				floodplayers.push(src);
			}
			playersonline[src].floodcount++;
			if (playersonline[src].floodcount > messageallowance){
				floodplayers.splice(floodplayers.indexOf(src), 1);
				if (playersonline[src].floodcount != Infinity){
					sys.sendHtmlAll("<timestamp/><b>The server has kicked " + srcname + " for flooding.</b>", channel);
					sys.callQuickly("sys.kick(" + src + ");", 200);
				}
				playersonline[src].floodcount = Infinity;
				sys.stopEvent();
				return;
			}		
			if (playersonline[src].commandassist != undefined){
				commandassists[playersonline[src].commandassist](src, message, channel);
			}
		}
		if ((message[0] == "/" || message[0] == "!") && message.length > 1){
			sys.stopEvent();
			var command = message.substr(1, message.length).split(' ');
			if (commands[command[0].toLowerCase()] != undefined){
				command[0] += "*" + command[1];
				command.splice(1,1);
			}
			command = command.join(' ');
			command = command.split('*');
			if (commands[command[0].toLowerCase()] === undefined){
				sys.sendHtmlMessage(src, "<timestamp/><i>The server does not recognise " + helpers.escapehtml(command[0]).bold() + " as a valid command.</i>", channel);
				return;
			}
			commands[command[0].toLowerCase()](src,channel, command);
			return;
		}
		if (sys.auth(src) < silence){
			sys.stopEvent();
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, your server auth level has been silenced.</i>", channel);
			return;
		}
		if (helpers.mutecheck(srcname) == true){
			sys.stopEvent();
			helpers.mutemessage(src, channel);
			return;
		}
		if (channelsonline[channel].combinecharacters != undefined){
			if (channelsonline[channel].combinecharacters == "off" && /[\u0300-\u036F]/.test(message)){
				sys.stopEvent();
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to use combining characters.</i>", channel);
				return;
			}
		}
		if (channelsonline[channel].reversecharacters != undefined){
			if (channelsonline[channel].reversecharacters == "off" && /[\u202E\u202D]/.test(message)){
				sys.stopEvent();
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to use reversing characters.</i>", channel);
			}
		}				
	}

	,

	afterChatMessage: function(src,message, channel){
	}

	,

	beforePlayerKick : function (src, trgt){
		sys.stopEvent();
		helpers.kick(src, trgt);
	}

	,

	beforePlayerAway: function(src, away){
	}

	,

	afterPlayerAway: function(src, away){
	}

	,

	afterPlayerKick : function (src, trgt){
	}

	,

	beforePlayerBan : function(src, trgt){
		sys.stopEvent();
		var srcname = sys.name(src),  trgtname = sys.name(trgt);
		helpers.ban(srcname, trgtname);
	}

	,

	afterPlayerBan : function(src, trgt){
	}

	,

	beforeChallengeIssued: function(src, trgt, clauses, rated, mode){
		var channelids = sys.channelIds(), channelidsindex, srctier = sys.tier(src), trgttier = sys.tier(trgt), srcname = sys.name(src).toLowerCase(), trgtname = sys.name(trgt).toLowerCase(), srccheck = true, trgtcheck = true, paircheck = true, srctiercheck = true, trgttiercheck = true, srcplaycheck = true, trgtplaycheck = true, srcreadycheck = true, trgtreadycheck = true, srcsignready = true, trgtsignready = true, clausescheck = true;
		for (channelidsindex in channelids){
			var tourmemberssrc = helpers.tourmembersnumber(srcname, channelids[channelidsindex]), tourmemberstrgt = helpers.tourmembersnumber(trgtname, channelids[channelidsindex]);	
			if (tour[channelids[channelidsindex]].tourmode == 1){
				if (channelsonline[channelids[channelidsindex]].ReadyForTour == "on"){
					if (tour[channelids[channelidsindex]].tourmembers.indexOf(srcname) != -1){
						srcsignready = false;	
					}
					if (tour[channelids[channelidsindex]].tourmembers.indexOf(trgtname) != -1){
						trgtsignready = false;	
					}						
				}
			}
			if (tour[channelids[channelidsindex]].tourmode == 2){			
				if (channelsonline[channelids[channelidsindex]].ForceTourBattles == "on"){
					srccheck = false;
					trgtcheck = false;
					paircheck = false;
					srctiercheck = false; 
					trgttiercheck = false;
					srcplaycheck = false; 
					trgtplaycheck = false;
					if (tour[channelids[channelidsindex]].tourwinners.indexOf(srcname) != -1 || tour[channelids[channelidsindex]].tourlosers.indexOf(srcname) != -1 || tour[channelids[channelidsindex]].tourmembers.indexOf(srcname) == -1){
						srcplaycheck = true;
					}
					if (tour[channelids[channelidsindex]].tourwinners.indexOf(trgtname) != -1 || tour[channelids[channelidsindex]].tourlosers.indexOf(trgtname) != -1 || tour[channelids[channelidsindex]].tourmembers.indexOf(trgtname) == -1){
						trgtplaycheck = true;
					}
					if (typeof(tourmemberssrc) == "number"){
						srccheck = true;
					}
					if (typeof(tourmemberstrgt) == "number"){
						trgtcheck = true;
					}
					if (!helpers.nopair(tourmemberssrc, tourmemberstrgt)){
						paircheck = true;
					}
					if (srctier == tour[channelids[channelidsindex]].tourtier){
						srctiercheck = true;
					} 
					if (trgttier == tour[channelids[channelidsindex]].tourtier){
						trgttiercheck = true;
					}
					if (channelsonline[channelids[channelidsindex]].EnforceTourClauses == "on" && tour[channelids[channelidsindex]].tourclauses != clauses){
						clausescheck = false;
					}
				}
				if (channelsonline[channelids[channelidsindex]].ReadyForTour == "on"){
					if (tour[channelids[channelidsindex]].tourwinners.indexOf(srcname) != -1){
						srcreadycheck = false;
					}
					if (tour[channelids[channelidsindex]].tourwinners.indexOf(trgtname) != -1){
						trgtreadycheck = false;
					}
				}                 
			}
		}
		if (!srcsignready){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because you have to be ready for your first tournament battle.</i>");
			sys.stopEvent();
			return;
		}
		if (!trgtsignready){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because they have to be ready for their first tournament battle.</i>");
			sys.stopEvent();
			return;
		}
		if (!srcreadycheck){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because you have to be ready for your next tournament battle.</i>");
			sys.stopEvent();
			return;
		}
		if (!trgtreadycheck){
			sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because they have to be ready for their next tournament battle.</i>");
			sys.stopEvent();
			return;
		}
		if (!srcplaycheck || !trgtplaycheck){
			if (srccheck && !trgtcheck){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because they are not involved in this tournament round currently.</i>");
				sys.stopEvent();
				return;
			}
			if (!srccheck && trgtcheck){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because they are involved in a  tournament round currently.</i>");
				sys.stopEvent();
				return;
			}
			if (!paircheck){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because you aren't their opponent for this tournament round.</i>");
				sys.stopEvent();
				return;			
			}
			if (!srctiercheck){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because you aren't playing in the correct tier for the tournament.</i>");
				sys.stopEvent();
				return;
			}
			if (!trgttiercheck){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because they aren't playing in the correct tier for the tournament.</i>");
				sys.stopEvent();
				return;
			}
			if (!clausescheck){
				sys.sendHtmlMessage(src, "<timestamp/><i>Sorry, you are unable to challenge " + members[trgtname] + " because you aren't challenging with the correct clauses for the tournament.</i>");
				sys.stopEvent();
			}
		}
	}

	,

	afterChallengeIssued: function(src, trgt, clauses, rated, mode){
	}

	,

	beforeFindBattle: function (src){
		if (findbattlemessage === "on"){
			sys.sendAll(sys.name(src) + " has clicked Find Battle in the " + sys.tier(src) + " tier!");
		}
	}

	,

	afterFindBattle: function (src){
	}

	,

	beforeBattleMatchup: function (src, trgt, clauses, rated, mode){
	}

	,

	afterBattleMatchup: function (src, trgt, clauses, rated, mode){
	}

	,

	battleSetup: function (src, trgt, battle){
		battlesonline[battle] = new Object();
		battlesonline[battle].p1 = src;
		battlesonline[battle].p2 = trgt;
		battlesonline[battle].starttime = new Date();
		battlesonline[battle].tier = sys.tier(src) == sys.tier(trgt) ? sys.tier(src) : "None";
	}

	,

	beforeBattleStarted: function(src, trgt, clauses, rated, mode){
	}

	,

	afterBattleStarted: function(src, trgt, clauses, rated, mode){
		battlers.push(src);
		battlers.push(trgt);
		if (battlers.length/2 > battlerecord){
			battlerecord = battlers.length/2;
			sys.saveVal("Battle_Record", battlerecord);
		}
		totalbattles++;
		sys.saveVal("Total_Battles", totalbattles);
		var channelids = sys.channelIds(), channelidsindex;
		for (channelidsindex in channelids){
			if (tour[channelids[channelidsindex]].tourmode == 2){
				var srcname = sys.name(src).toLowerCase(), trgtname = sys.name(trgt).toLowerCase(), srctier = sys.tier(src), trgttier = sys.tier(trgt), tourmemberssrc = helpers.tourmembersnumber(srcname, channelids[channelidsindex]), tourmemberstrgt = helpers.tourmembersnumber(trgtname, channelids[channelidsindex]);
				if (srctier == tour[channelids[channelidsindex]].tourtier && trgttier == tour[channelids[channelidsindex]].tourtier && typeof(tourmemberssrc) == "number" && typeof(tourmemberstrgt) == "number" && tour[channelids[channelidsindex]].tourwinners.indexOf(srcname) == -1 && tour[channelids[channelidsindex]].tourwinners.indexOf(trgtname) == -1){
					if (!helpers.nopair(tourmemberssrc, tourmemberstrgt)){
						tour[channelids[channelidsindex]].tourbattlers.push(tour[channelids[channelidsindex]].tourmembers[tourmemberssrc]);
						tour[channelids[channelidsindex]].tourbattlers.push(tour[channelids[channelidsindex]].tourmembers[tourmemberstrgt]);
						var finalroundcheck = tour[channelids[channelidsindex]].tourcurrentnumber == 2 ? "Final Round" : "Round " + tour[channelids[channelidsindex]].roundnumber;
						sys.sendHtmlAll("<timestamp/><b><font color='green'>" + finalroundcheck + " match between " + members[srcname] + " and " + members[trgtname] + " has been started.</font></b>",channelids[channelidsindex]);
					}
				}
			}
		}
	}

	,

	attemptToSpectateBattle: function(src, battler1, battler2){
	}

	,

	beforeSpectateBattle: function(src, battler1, battler2){
	}

	,

	afterSpectateBattle: function(src, battler1, battler2){
	}

	,	

	beforeBattleEnded: function(winner, loser, result, battle){
	}

	,

	afterBattleEnded: function(winner, loser, result, battle){
		battlers.splice(battlers.indexOf(winner), 1); 
		battlers.splice(battlers.indexOf(loser), 1);
		delete battlesonline[battle];
		var channelids = sys.channelIds(), channelidsindex;
		for (channelidsindex in channelids){
			if (tour[channelids[channelidsindex]].tourmode == 2){
				var winnername = sys.name(winner), losername = sys.name(loser), tourmemberswinner = helpers.tourmembersnumber(winnername.toLowerCase(), channelids[channelidsindex]), tourmembersloser = helpers.tourmembersnumber(losername.toLowerCase(), channelids[channelidsindex]);
				if (tour[channelids[channelidsindex]].tourbattlers.indexOf(winnername.toLowerCase()) != -1 && tour[channelids[channelidsindex]].tourbattlers.indexOf(losername.toLowerCase()) != -1 && !helpers.nopair(tourmemberswinner, tourmembersloser)){
					if (result == "tie"){
						var tourwinner = tour[channelids[channelidsindex]].tourbattlers.indexOf(winnername.toLowerCase()), tourloser = tour[channelids[channelidsindex]].tourbattlers.indexOf(losername.toLowerCase());
						tour[channelids[channelidsindex]].tourbattlers.splice(tourloser,1); 
						tour[channelids[channelidsindex]].tourbattlers.splice(tourwinner,1);
						var repeatmatchmessage = border2 + "<br/>"
						+ "<timestamp/><font color='indigo'><b> A tournament match has been tied.</b></font><br/>"
						+ "<b>" + winnername + " and " + losername + " need to battle again!</b><br/>"
						+ border2;
						sys.sendHtmlAll(repeatmatchmessage, channelids[channelidsindex]);
						return;
					}
					var matchcompletemessage = border2 + "<br/>"
					+ "<timestamp/><font color='green'><b>A tournament match has been completed!<b></font>";
					sys.sendHtmlAll(matchcompletemessage, channelids[channelidsindex]);
					helpers.roundincrease(winnername.toLowerCase(), losername.toLowerCase(), channelids[channelidsindex]);
				}
			}	
		}
	}
})