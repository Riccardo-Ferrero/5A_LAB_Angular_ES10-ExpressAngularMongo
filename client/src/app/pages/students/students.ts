import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Auth} from '../../services/auth';
import {Httpcall} from '../../services/httpcall';
import {Router} from '@angular/router';
import { Student } from '../../models/student.model';

@Component({
  selector: 'students',
  imports: [FormsModule, CommonModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit{
  constructor(private auth:Auth, private http:Httpcall,private router:Router,private cdr:ChangeDetectorRef) {  }
  loading:boolean=false;
  errorMessage:String = "";
  successMessage:String = "";
  students: Student[] = [];
  showStats: boolean=false;
  filtroCognome: string="";
  showForm: boolean=false;
  isEditing: boolean=false;

  formData = {
    nome: "",
    cognome: "",
    eta: 0,
    indirizzo: {
      via: "",
      citta: "",
      CAP: ""
    },
  }
  interessiString: string="";
  corsiString: string="";

  ngOnInit() {
    this.loadAll();
  }

  loadAll(){
    this.loading=true;
    this.errorMessage="";
    this.http.getCall('/api/students').subscribe({
      next: (res) =>{
        this.auth.saveToken(res.newToken);
        this.students=res.data;
        console.log(this.students);
        this.loading=false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading=false;
        this.errorMessage="Errore nel caricamento degli studenti";
        this.cdr.detectChanges();
      }
    });
  }

  caricaStatistiche() {

  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }

  nuovoStudente(){
    this.showForm=true;
    this.isEditing=false;
    this.formData = {
      nome: "",
      cognome: "",
      eta: 0,
      indirizzo: {
        via: "",
        citta: "",
        CAP: ""
      }
    };
    this.interessiString = "";
    this.corsiString = "";
  }

  cerca() {
    this.loading=true;
    this.errorMessage="";
    this.http.postCall('/api/students/cercaPerCognome', { cognome: this.filtroCognome }).subscribe({
      next: (res) =>{
        this.auth.saveToken(res.newToken);
        this.students=res.data;
        console.log(this.students);
        this.loading=false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading=false;
        this.errorMessage="Errore nel caricamento degli studenti";
        this.cdr.detectChanges();
      }
    });
  }

  salva(){
    if(this.formData.nome.trim() === "" || this.formData.cognome.trim() === ""){
      this.errorMessage="Nome e cognome sono obbligatori";
      return;
    }
    const documento: any = {
      nome: this.formData.nome,
      cognome: this.formData.cognome,
      eta: this.formData.eta,
      indirizzo: {
        via: this.formData.indirizzo.via,
        citta: this.formData.indirizzo.citta,
        CAP: this.formData.indirizzo.CAP
      },
      interessi: this.interessiString.split(",").map(i => i.trim()).filter(i => i !== ""),
      corsi: this.corsiString.split(",").map(c => c.trim()).filter(c => c !== "").map(c => ({nome:c.split(":")[0].trim(), voto: parseInt(c.split(":")[1].trim())}))
    }
    this.http.postCall('/api/students/inserisci', documento).subscribe({
      next: (res) =>{
        this.auth.saveToken(res.newToken);
        this.successMessage="Studente inserito con successo";
        this.showForm=false;
        this.loadAll();
      },
      error: (err) => {
        this.errorMessage="Errore nell'inserimento dello studente";
        this.cdr.detectChanges();
      }
    });

  }

  annulla(){
    this.showForm=false;
    this.isEditing=false;
    this.formData = {
      nome: "",
      cognome: "",
      eta: 0,
      indirizzo: {
        via: "",
        citta: "",
        CAP: ""
      }
    };
    this.interessiString = "";
    this.corsiString = "";
  }
}
