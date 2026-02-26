using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AYA_UIS.Domain.Entities
{
    public class BaseEntities <TKey>
    {
        public TKey Id { get; set; } 
    }
}
