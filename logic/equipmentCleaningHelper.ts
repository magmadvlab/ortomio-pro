'use client';

export interface CleaningProtocol {
  seedTray: {
    steps: string[];
    sterilization: {
      method: 'Bleach' | 'HydrogenPeroxide';
      solution: string; // Es. "10% candeggina"
      duration: number; // minuti
      safety: string[];
    };
    drying: string[];
  };
  heatingMat: {
    steps: string[];
    warning: string;
  };
  soilReuse: {
    allowed: boolean;
    alternative: string;
  };
}

/**
 * Restituisce il protocollo completo di pulizia e disinfezione per attrezzature da semina
 */
export const getCleaningProtocol = (): CleaningProtocol => {
  return {
    seedTray: {
      steps: [
        'Svuota ogni residuo di terriccio vecchio e radici secche',
        'Ammollo: metti vaschette, sottovasi e coperchi in acqua calda con detersivo per piatti per 30 minuti',
        'Spazzolatura: usa spugna ruvida o spazzolino per pulire gli angoli delle cellette',
        'Risciacquo veloce per togliere la schiuma'
      ],
      sterilization: {
        method: 'Bleach',
        solution: '10% candeggina (1 bicchiere candeggina + 9 bicchieri acqua)',
        duration: 15,
        safety: [
          'Usa guanti e lavora in stanza ventilata o all\'aperto',
          'Se galleggiano, metti un peso sopra (sasso pulito o bottiglia piena)',
          'Risciacqua abbondantemente sotto acqua corrente fredda per rimuovere ogni traccia di cloro',
          'Lascia asciugare al sole diretto per 2 ore (raggi UV sterilizzano naturalmente)',
          'Non impilare se ancora umide - devono essere completamente asciutte'
        ]
      },
      drying: [
        'Asciugatura al sole diretto per 2 ore (raggi UV sono sterilizzante naturale extra)',
        'Non impilare le vaschette se sono ancora umide - creeresti muffa',
        'Devono essere "secche come il deserto" prima di essere messe via'
      ]
    },
    heatingMat: {
      steps: [
        'MAI IMMERGERE il tappetino riscaldante!',
        'Stacca dalla corrente',
        'Pulisci con panno inumidito con acqua e alcool denaturato',
        'Oppure usa uno spruzzo di disinfettante per superfici',
        'Asciuga subito'
      ],
      warning: 'Il tappetino riscaldante NON deve essere immerso in acqua o soluzioni disinfettanti.'
    },
    soilReuse: {
      allowed: false,
      alternative: 'Mai riutilizzare il terriccio dei semenzai. Una volta usato per la germinazione, è "esausto" e potenzialmente contaminato. Buttalo nel compost o usalo per riempire buche in giardino, ma non usarlo per nuovi semi delicati.'
    }
  };
};

/**
 * Restituisce metodo alternativo di sterilizzazione (acqua ossigenata)
 */
export const getAlternativeSterilizationMethod = (): {
  method: string;
  instructions: string[];
} => {
  return {
    method: 'Acqua Ossigenata (metodo delicato)',
    instructions: [
      'Usa acqua ossigenata al 3% (quella classica da disinfezione ferite, 10 volumi)',
      'Puoi usarla pura in uno spruzzino e inondare le vaschette',
      'Oppure diluita 50/50 con acqua se le immergi',
      'Lascia agire finché "frizza" (circa 20 minuti)',
      'È meno potente della candeggina sui virus, ma ottima contro i funghi',
      'Ideale se odi l\'odore della candeggina o hai animali domestici in giro'
    ]
  };
};

/**
 * Genera istruzioni di pulizia personalizzate per una specie
 */
export const getCleaningInstructionsForSpecies = (
  seedTrayCleaning?: string,
  heatingMatCleaning?: string,
  soilReuse?: 'Never' | 'CompostOnly' | 'Allowed'
): string[] => {
  const instructions: string[] = [];
  const protocol = getCleaningProtocol();
  
  instructions.push('🧹 Pulizia e Disinfezione Attrezzature:');
  instructions.push('');
  
  // Pulizia vaschette
  instructions.push('📦 Vaschette/Semenzai:');
  if (seedTrayCleaning) {
    instructions.push(`   ${seedTrayCleaning}`);
  } else {
    instructions.push('   ' + protocol.seedTray.steps.join('\n   '));
  }
  
  instructions.push('');
  instructions.push('   Sterilizzazione:');
  instructions.push(`   Metodo: ${protocol.seedTray.sterilization.method === 'Bleach' ? 'Candeggina' : 'Acqua Ossigenata'}`);
  instructions.push(`   Soluzione: ${protocol.seedTray.sterilization.solution}`);
  instructions.push(`   Durata: ${protocol.seedTray.sterilization.duration} minuti`);
  instructions.push('   Sicurezza:');
  protocol.seedTray.sterilization.safety.forEach(safety => {
    instructions.push(`     • ${safety}`);
  });
  
  instructions.push('');
  instructions.push('   Asciugatura:');
  protocol.seedTray.drying.forEach(drying => {
    instructions.push(`   ${drying}`);
  });
  
  // Pulizia tappetino
  instructions.push('');
  instructions.push('🌡️ Tappetino Riscaldante:');
  if (heatingMatCleaning) {
    instructions.push(`   ${heatingMatCleaning}`);
  } else {
    instructions.push(`   ⚠️ ${protocol.heatingMat.warning}`);
    protocol.heatingMat.steps.forEach(step => {
      instructions.push(`   ${step}`);
    });
  }
  
  // Riutilizzo terriccio
  instructions.push('');
  instructions.push('🌱 Terriccio:');
  if (soilReuse === 'Never') {
    instructions.push(`   ⚠️ ${protocol.soilReuse.alternative}`);
  } else if (soilReuse === 'CompostOnly') {
    instructions.push('   Puoi compostare il terriccio usato, ma NON riutilizzarlo direttamente per nuovi semi.');
  } else if (soilReuse === 'Allowed') {
    instructions.push('   Il terriccio può essere riutilizzato dopo sterilizzazione.');
  } else {
    instructions.push(`   ${protocol.soilReuse.alternative}`);
  }
  
  return instructions;
};

