//Size of the int array
#define INT_ARRAY_SIZE	2

namespace Exchange
{
	//Class I want to return to NODE.JS
	class My_class
	{
		public:
			//Constructor
			My_class( void );
			//Public references
			float &my_float( void );
			int &my_int( int index );
		private:
			//Private class vars
			float g_my_float;
			int g_my_int[4];
	};
}	//End namestace: User