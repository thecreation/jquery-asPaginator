#jquery-asPaginator

asPaginator was designed to make implementation as easy as possible. Before implementing, make sure you meet the minimum requirements.


![image][]
 [image]: https://raw.github.com/amazingSurge/jquery-asPaginator/master/demo/img/asPaginator.png

### Compatibility
- Requires jQuery 1.83+
- Tested in Firefox, Chrome, Safari, IE8+ 

### Implementation

For the most basic implementation, follow the steps below:

1.	Download the [jquery-asPaginator](https://raw.github.com/amazingSurge/jquery-asPaginator) Package

2.	Unzip the package and upload the following files into a folder on your website:  

	-  jquery.asPaginator.js
	-  asPaginator.css 

3.	On the page you are implementing asPaginator on, add a reference to the jQuery library.

		<script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>

4.	Below the reference to jQuery, add a reference to the asPaginator script.

		<script type="text/javascript" src="/jquery.asPaginator.js"></script>

5.	On the page, add a div (or any other element with an class works).

		<div class="jquery-asPaginator"><div>

6.	Initialize asPaginator on the file input. the first argument is the total records get from your server , the second is options. 
		
		$(document).ready(function() {
		    $(".jquery-asPaginator").asPaginator(100,{
		        currentPage: 1,
		        itemsPerPage: 10,
		        skin: 'skin-1',
		        onShow: function(page) {
		        	// here sets page link
		            var url = '' + page;
		            
		            console.log('ajax request')
		            $.ajax({
		                url: url,
		                dataType: 'json',
		                success: function(data) {

		                }
		            })
		        }
		    });                         
		});

7.	Add a link to the asPaginator stylesheets in the head of the document.

		<link rel="stylesheet" type="text/css" href="asPaginator.css" />

8.	The final page should look like the following:

		<!DOCTYPE html>
		<html>
		<head>
		    <title>My Uploadify Implementation</title>
		    <link rel="stylesheet" type="text/css" href="uploadify.css">
		    <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
		    <script type="text/javascript" src="jquery.uploadify-3.1.min.js"></script>
		    <script type="text/javascript">
		    $(function() {
		        $(document).ready(function() {
				    $(".jquery-asPaginator").asPaginator(100,{
				        currentPage: 1,
				        numPerPage: 10,
				        skin: 'skin-1',
				        onShow: function(page) {
				        	// here sets page link
				            var url = '' + page;
				            
				            console.log('ajax request')
				            $.ajax({
				                url: url,
				                dataType: 'json',
				                success: function(data) {

				                }
				            })
				        }
				    });                         
				});
		    });
		    </script>
		</head>
		<body>
		<input type="file" name="file_upload" id="file_upload" />
		</body>
		</html>