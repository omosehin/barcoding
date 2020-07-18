using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Manual_Validation.Models
{
    public class Barcode
    {
        public string Text { get; set; }
        public string Text2 { get; set; }
        public string Response { get => Text != null ? "Successful" : "Failed"; }
    }
}