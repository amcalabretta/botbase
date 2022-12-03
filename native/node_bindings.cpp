//NODE bindings
#include <napi.h>
//C++ Class I want to return to NODE.JS
#include "my_class.h"

//Instance of My_class I want to return to NODE.JS
Exchange::CryptoExchanges g_instance;

//Aid function that constructs a NODE.JS array from a C++ pointer
template <typename T>
extern Napi::Array construct_array( Napi::Env env, T *array_data, unsigned int array_size );

//Prototype of function called by NODE.JS that initializes this module
extern Napi::Object init(Napi::Env env, Napi::Object exports);
//Prototype of function that returns a standard type: WORKS
extern Napi::Number get_my_float(const Napi::CallbackInfo& info);
//Prototype of function that returns My_class to NODE.JS: DOES NOT WORK!!!
extern Napi::Object get_my_class(const Napi::CallbackInfo& info);

//Aid function that constructs a NODE.JS array from a C++ pointer
template <typename T>
Napi::Array construct_array( Napi::Env env, T *array_data, unsigned int array_size )
{
	//Construct int array
	Napi::Array ret_rmp = Napi::Array::New( env, array_size );
	//For each entry
	for (unsigned int t = 0; t < array_size; t++)
	{
		//Fill entry
		ret_rmp[t] = Napi::Number::New(env, (T)array_data[t] );
	}
	//Return constructed array
	return (Napi::Array)ret_rmp;
}

//Initialize instance
Napi::Object init(Napi::Env env, Napi::Object exports)
{
	//Construct the instance of My_class I want to return to NODE.JS
	g_instance = Exchange::CryptoExchanges();
		//Register methods accessible from the outside in the NODE.JS environment
	//Return a standard type
	exports.Set( "get_my_float", Napi::Function::New(env, get_my_float) );
	//Return the whole class
	exports.Set( "get_my_class", Napi::Function::New(env, get_my_class) );

    return exports;
}	//End function: init | Napi::Env | Napi::Object

//Interface between function and NODE.JS
Napi::Number get_my_float(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
	//Check arguments
    if (info.Length() != 0)
	{
		Napi::TypeError::New(env, "ERR: Expecting no arguments").ThrowAsJavaScriptException();
	}
	//Get the return value
	float tmp = g_instance.my_float();
	//Return a NODE.JS number
    return Napi::Number::New(env, (float)tmp);
} //End Function: get_my_float | Napi::CallbackInfo&

//Interface between function and NODE.JS
Napi::Object get_my_class(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
	//Check arguments
    if (info.Length() != 0)
	{
		Napi::TypeError::New(env, "ERR: Expecting no arguments").ThrowAsJavaScriptException();
	}
	//Get a copy of the instance of the class I want to return
	Exchange::CryptoExchanges tmp = g_instance;
	//Construct empty return object in the NODE.JS environment
	Napi::Object ret_tmp = Napi::Object::New( env );
	//Manually create and fill the fields of the return object
	ret_tmp.Set("my_float", Napi::Number::New( env, (float)tmp.my_float() ));
	//Add array to return object
	ret_tmp.Set("my_int", (Napi::Array)construct_array<int>( env, (int *)&tmp.my_int( 0 ), INT_ARRAY_SIZE) );
	//Return a NODE.JS Object
    return (Napi::Object)ret_tmp;
} //End Function: get_my_class | Napi::CallbackInfo&

NODE_API_MODULE( My_cpp_module, init )